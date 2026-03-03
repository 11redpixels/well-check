import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:developer' as developer;
import 'package:well_check/services/notification_service.dart';
import 'package:well_check/models/user_role.dart';

class SupabaseAuthService {
  final SupabaseClient _supabase = Supabase.instance.client;
  bool isOnboarding = false;

  User? get currentUser => _supabase.auth.currentUser;
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  void initializeAuthListener() {
    _supabase.auth.onAuthStateChange.listen((data) async {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;

      developer.log("SUPABASE AUTH EVENT | $event | Session: ${session != null}");

      if (event == AuthChangeEvent.signedIn || event == AuthChangeEvent.initialSession) {
        if (session != null) {
          developer.log("SUPABASE AUTH | Deep Link/Login caught session: ${session.user.id}");
          
          // GHOST USER AUDIT: Ensure profile exists for this session
          await performGhostAudit(session.user.id);
          
          // SYNC FCM TOKEN ON AUTH STATE CHANGE
          NotificationService.syncTokenToSupabase();
        }
      }
    });
  }

  Future<void> performGhostAudit(String userId) async {
    try {
      // AUDIT EXCEPTION: Ignore users in the middle of onboarding choice
      if (isOnboarding) {
        developer.log("SUPABASE AUTH | Audit skipped: User is currently onboarding.");
        return;
      }

      final profile = await _supabase
          .from('profiles')
          .select()
          .eq('auth_id', userId)
          .maybeSingle();
      
      if (profile == null) {
        final user = _supabase.auth.currentUser;
        final lastSignIn = user?.lastSignInAt;
        
        if (lastSignIn != null) {
          final sessionAge = DateTime.now().difference(DateTime.parse(lastSignIn));
          if (sessionAge.inMinutes < 5) {
            developer.log("SUPABASE AUTH | NEW USER DETECTED: No profile yet for $userId. Within 5m grace period.");
            return; // Allow staying logged in for onboarding
          }
        }

        developer.log("SUPABASE AUTH | GHOST DETECTED: No profile for $userId after grace period. Forcing sign-out.");
        await signOut();
      } else {
        developer.log("SUPABASE AUTH | Profile audit passed for $userId");
      }
    } catch (e) {
      developer.log("SUPABASE AUTH | Profile audit failed with error: $e");
    }
  }

  Future<AuthResponse> signUp(
    String email,
    String password,
    String firstName,
    String role,
  ) async {
    try {
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'first_name': firstName, 'role': role},
      );

      // JITTER DELAY: Resolve race condition for unconfirmed emails
      await Future.delayed(const Duration(milliseconds: 500));
      
      // FORCE SESSION REFRESH: Ensure token is live
      try {
        await _supabase.auth.refreshSession();
      } catch (e) {
        developer.log("SUPABASE AUTH | Session refresh skipped: $e");
      }

      final userId = response.user?.id;
      if (userId != null) {
        developer.log("SUPABASE AUTH | User signed up: $userId. Creating manual profile...");
        
        // SQL GUARD: Verify schema columns exist before upsert
        try {
          final columnCheck = await _supabase
              .from('information_schema.columns')
              .select('column_name')
              .eq('table_name', 'profiles')
              .filter('column_name', 'in', '(first_name,role,status,is_authorized,sub_role,is_managed)');
          
          developer.log("SUPABASE AUTH | Schema Check: Found ${columnCheck.length} required columns.");
        } catch (e) {
          developer.log("SUPABASE AUTH | Schema Check Failed: $e. Proceeding with caution.");
        }

        // FORCED MANUAL PROFILE CREATION (Bypass triggers)
        await _supabase.from('profiles').upsert({
          'auth_id': userId,
          'first_name': firstName,
          'role': role,
          'status': role == UserRole.familyHead.name ? 'Active' : 'Pending',
          'is_authorized': role == UserRole.familyHead.name,
          'last_updated': DateTime.now().toIso8601String(),
          'is_managed': false,
        }, onConflict: 'auth_id');
        
        developer.log("SUPABASE AUTH | Profile manually confirmed for $userId");
      }

      return response;
    } catch (e) {
      developer.log("SUPABASE AUTH | Sign up error: $e");
      rethrow;
    }
  }

  Future<void> resendVerificationEmail(String email) async {
    try {
      await _supabase.auth.resend(
        type: OtpType.signup,
        email: email,
      );
      developer.log("SUPABASE AUTH | Verification email resent to: $email");
    } catch (e) {
      developer.log("SUPABASE AUTH | Resend error: $e");
      rethrow;
    }
  }

  Future<AuthResponse> signIn(String email, String password) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      // SYNC FCM TOKEN ON LOGIN
      await NotificationService.syncTokenToSupabase();

      developer.log("SUPABASE AUTH | User signed in: ${response.user?.id}");
      return response;
    } catch (e) {
      developer.log("SUPABASE AUTH | Sign in error: $e");
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
    developer.log("SUPABASE AUTH | User signed out.");
  }
}

final supabaseAuthProvider = Provider<SupabaseAuthService>(
  (ref) => SupabaseAuthService(),
);

// A stream provider to listen to auth state changes for the router
final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(supabaseAuthProvider).authStateChanges;
});

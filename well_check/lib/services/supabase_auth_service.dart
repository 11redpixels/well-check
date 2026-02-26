import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:developer' as developer;
import 'package:well_check/services/notification_service.dart';

class SupabaseAuthService {
  final SupabaseClient _supabase = Supabase.instance.client;

  User? get currentUser => _supabase.auth.currentUser;
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  void initializeAuthListener() {
    _supabase.auth.onAuthStateChange.listen((data) {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;

      developer.log("SUPABASE AUTH EVENT | $event | Session: ${session != null}");

      if (event == AuthChangeEvent.signedIn || event == AuthChangeEvent.initialSession) {
        if (session != null) {
          developer.log("SUPABASE AUTH | Deep Link/Login caught session: ${session.user.id}");
          // SYNC FCM TOKEN ON AUTH STATE CHANGE
          NotificationService.syncTokenToSupabase();
        }
      }
    });
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
      developer.log("SUPABASE AUTH | User signed up: ${response.user?.id}");
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

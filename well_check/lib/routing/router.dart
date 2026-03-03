import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:well_check/features/family_head/family_head_view.dart';
import 'package:well_check/features/driving/driving_view.dart';
import 'package:well_check/features/health/health_trends_view.dart';
import 'package:well_check/features/health/behavioral_assessment_view.dart';
import 'package:well_check/features/panic/panic_view.dart';
import 'package:well_check/features/auth/login_view.dart';
import 'package:well_check/features/invite/invite_view.dart';
import 'package:well_check/features/medications/medications_view.dart';
import 'package:well_check/features/medications/med_chest_view.dart';
import 'package:well_check/features/history/history_view.dart';
import 'package:well_check/features/geofence/geofence_view.dart';
import 'package:well_check/features/geofence/safe_zones_view.dart';
import 'package:well_check/features/history/check_in_history.dart';
import 'package:well_check/features/history/daily_checkins_view.dart';
import 'package:well_check/features/legal/consent_ledger_view.dart'; // NEW
import 'package:well_check/features/notifications/notification_center_view.dart';
import 'package:well_check/features/settings/settings_view.dart';
import 'package:well_check/features/settings/notification_settings_view.dart';
import 'package:well_check/features/settings/permissions_hub_view.dart'; // NEW
import 'package:well_check/features/settings/connectivity_view.dart';
import 'package:well_check/features/emergency/voice_chat_view.dart'; // NEW
import 'package:well_check/features/member/member_home_view.dart';
import 'package:well_check/features/elder_home/elder_home_view.dart';
import 'package:well_check/features/elder_home/visitor_log_view.dart';
import 'package:well_check/features/contacts/contacts_view.dart';
import 'package:well_check/features/status/status_view.dart';
import 'package:well_check/features/medical_vault/medical_ledger_view.dart';
import 'package:well_check/features/onboarding/onboarding_view.dart';
import 'package:well_check/features/onboarding/onboarding_choice_view.dart';
import 'package:well_check/features/onboarding/pending_approval_view.dart';
import 'package:well_check/features/onboarding/invite_member_view.dart';
import 'package:well_check/features/onboarding/family_setup_view.dart';
import 'package:well_check/features/hardware/device_pairing_view.dart';
import 'package:well_check/features/legal/terms_of_service.dart';
import 'package:well_check/features/legal/privacy_policy.dart';
import 'package:well_check/features/subscription/subscription_gate.dart';
import 'package:well_check/features/subscription/paywall_view.dart';
import 'package:well_check/widgets/global_scaffold.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/services/supabase_auth_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final profileStreamProvider = StreamProvider<Map<String, dynamic>?>((ref) {
  final session = Supabase.instance.client.auth.currentSession;
  if (session == null) return Stream.value(null);

  return Supabase.instance.client
      .from('profiles')
      .stream(primaryKey: ['id'])
      .eq('auth_id', session.user.id)
      .map((data) => data.isNotEmpty ? data.first : null);
});

final routerProvider = Provider<GoRouter>((ref) {
  final userNotifier = ref.read(userProvider.notifier);
  // Listen to both auth AND profile changes to trigger router rebuilds
  ref.watch(authStateProvider);
  ref.watch(profileStreamProvider);

  return GoRouter(
    initialLocation: '/onboarding',
    redirect: (context, state) {
      final session = Supabase.instance.client.auth.currentSession;
      final isAuthenticated = session != null;

      final isLoggingIn = state.uri.path == '/login';
      final isOnboarding = state.uri.path == '/onboarding';

      if (!isAuthenticated && !isLoggingIn && !isOnboarding) {
        return '/onboarding';
      }

      if (isAuthenticated) {
        final sbUser = session.user;

        // FRESH STATE SYNC: Fetch directly from DB to avoid stale metadata
        final profileResponse = await Supabase.instance.client
            .from('profiles')
            .select()
            .eq('auth_id', sbUser.id)
            .maybeSingle();

        final familyId = profileResponse?['family_id'];
        final roleStr = profileResponse?['role'] ?? 'member';
        final subRoleStr = profileResponse?['sub_role'];
        final firstName = profileResponse?['first_name'] ?? 'User';
        final isAuthorized = profileResponse?['is_authorized'] ?? false;

        final role = UserRole.values.firstWhere(
          (e) => e.name == roleStr,
          orElse: () => UserRole.member,
        );

        // Ensure local state is updated
        Future.microtask(
          () => userNotifier.setRole(
            role,
            id: sbUser.id,
            familyId: familyId,
            firstName: firstName,
            subRole: subRoleStr,
            isAuthorized: isAuthorized,
          ),
        );

        // IF NO FAMILY ID, FORCE SETUP (Unless already on setup screen)
        if (familyId == null && state.uri.path != '/onboarding-choice') {
          return '/onboarding-choice';
        }

        // IF FAMILY ID BUT NOT AUTHORIZED (And not on choice screen)
        if (familyId != null &&
            !isAuthorized &&
            role != UserRole.familyHead &&
            state.uri.path != '/pending-approval') {
          return '/pending-approval';
        }

        if (isLoggingIn || isOnboarding) {
          if (role == UserRole.familyHead) return '/family-head';

          // MEMBER ROUTING BASED ON SUB-ROLE
          if (subRoleStr == 'protected' || roleStr == 'protected') {
            return '/elder-home';
          }
          if (subRoleStr == 'minor' || roleStr == 'minor') return '/member-home';
          if (subRoleStr == 'monitor' || roleStr == 'monitor') {
            return '/family-head';
          }

          return '/family-head';
        }
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingView(),
      ),
      GoRoute(
        path: '/pending-approval',
        builder: (context, state) => const PendingApprovalView(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) {
          final inviteCode = state.uri.queryParameters['code'];
          return LoginView(inviteCode: inviteCode);
        },
      ),
      GoRoute(
        path: '/onboarding-choice',
        builder: (context, state) {
          final inviteCode = state.uri.queryParameters['code'];
          return OnboardingChoiceView(inviteCode: inviteCode);
        },
      ),
      GoRoute(
        path: '/family-setup',
        builder: (context, state) => const FamilySetupView(),
      ),
      GoRoute(
        path: '/paywall',
        builder: (context, state) => const PaywallView(),
      ),
      GoRoute(
        path: '/invite-member',
        builder: (context, state) => const InviteMemberView(),
      ),
      GoRoute(
        path: '/terms',
        builder: (context, state) => const TermsOfServiceView(),
      ),
      GoRoute(
        path: '/privacy',
        builder: (context, state) => const PrivacyPolicyView(),
      ),
      GoRoute(
        path: '/visitor-log',
        builder: (context, state) => const VisitorLogView(),
      ),

      ShellRoute(
        builder: (context, state, child) => GlobalScaffold(child: child),
        routes: [
          GoRoute(
            path: '/family-head',
            builder: (context, state) => const FamilyHeadView(),
          ),
          GoRoute(
            path: '/member-home',
            builder: (context, state) => const MemberHomeView(),
          ),
          GoRoute(
            path: '/elder-home',
            builder: (context, state) => const ElderHomeView(),
          ),
          GoRoute(
            path: '/driving',
            builder: (context, state) => const DrivingView(),
          ),
          GoRoute(
            path: '/health-trends',
            builder: (context, state) => const HealthTrendsView(),
          ),
          GoRoute(
            path: '/assessments',
            builder: (context, state) => const BehavioralAssessmentView(),
          ),
          GoRoute(
            path: '/panic',
            builder: (context, state) => const PanicView(),
          ),
          GoRoute(
            path: '/voice-bridge',
            builder: (context, state) => const VoiceChatView(),
          ), // NEW
          GoRoute(
            path: '/invite-family',
            builder: (context, state) => const InviteView(),
          ),
          GoRoute(
            path: '/medications',
            builder: (context, state) => const MedicationsView(),
          ),
          GoRoute(
            path: '/med-chest',
            builder: (context, state) => const MedChestView(),
          ),
          GoRoute(
            path: '/history',
            builder: (context, state) =>
                const SubscriptionGate(child: HistoryView()),
          ),
          GoRoute(
            path: '/geofence',
            builder: (context, state) => const GeofenceView(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationCenterView(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsView(),
          ),
          GoRoute(
            path: '/notification-settings',
            builder: (context, state) => const NotificationSettingsView(),
          ),
          GoRoute(
            path: '/permissions-hub',
            builder: (context, state) => const PermissionsHubView(),
          ), // NEW
          GoRoute(
            path: '/connectivity',
            builder: (context, state) => const ConnectivityView(),
          ),
          GoRoute(
            path: '/contacts',
            builder: (context, state) => const ContactsView(),
          ),
          GoRoute(
            path: '/status',
            builder: (context, state) => const StatusView(),
          ),
          GoRoute(
            path: '/medical-vault',
            builder: (context, state) => const MedicalLedgerView(),
          ),
          GoRoute(
            path: '/pair-device',
            builder: (context, state) => const DevicePairingView(),
          ),
          GoRoute(
            path: '/daily-checkins',
            builder: (context, state) =>
                const SubscriptionGate(child: DailyCheckinsView()),
          ),
          GoRoute(
            path: '/safe-zones',
            builder: (context, state) => const SafeZonesView(),
          ),
          GoRoute(
            path: '/checkin',
            builder: (context, state) => const CheckInHistoryView(),
          ),
          GoRoute(
            path: '/consent-ledger',
            builder: (context, state) => const ConsentLedgerView(),
          ),
        ],
      ),
    ],
  );
});

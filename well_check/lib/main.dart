import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/routing/router.dart';
import 'package:well_check/theme/app_theme.dart';
import 'package:well_check/theme/dark_theme.dart';
import 'package:well_check/services/stitch_sync.dart';
import 'package:well_check/services/hardware_monitor.dart';
import 'package:well_check/services/subscription_service.dart';
import 'package:well_check/providers/app_state_provider.dart';
import 'package:well_check/widgets/sentinel_overlay.dart';
import 'package:well_check/services/inactivity_monitor.dart'; // NEW
import 'package:well_check/services/weather_sentinel.dart'; // NEW
import 'package:well_check/services/emergency_voice_service.dart'; // NEW
import 'package:well_check/services/supabase_auth_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/services/background_engine.dart';
import 'package:well_check/services/notification_service.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

// ANTOINE: INJECT REAL CREDENTIALS HERE
const String supabaseUrl = 'https://lravvptfltbfbfmbhomp.supabase.co';
const String supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyYXZ2cHRmbHRiZmJmbWJob21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTQyMDgsImV4cCI6MjA4NzU3MDIwOH0.h1q2XuRI-nwPJhulmrnvP_ma5DrTqC85INTVDBzwHv0';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb) {
    await Firebase.initializeApp();

    // CRASHLYTICS SETUP
    FlutterError.onError = (errorDetails) {
      FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
    };

    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
  }

  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);

  await SubscriptionService.init();
  await BackgroundEngine.initialize();
  await NotificationService.initialize();

  runApp(const ProviderScope(child: WellCheckApp()));
}

class WellCheckApp extends ConsumerStatefulWidget {
  const WellCheckApp({super.key});
  @override
  ConsumerState<WellCheckApp> createState() => _WellCheckAppState();
}

class _WellCheckAppState extends ConsumerState<WellCheckApp> {
  @override
  void initState() {
    super.initState();

    // EMERGENCY: FORCE LOGOUT TO CLEAR STUCK SESSION
    // ANTOINE: Remove this block once the session loop is resolved
    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      debugPrint("EMERGENCY | Stuck session detected. Clearing...");
      Supabase.instance.client.auth.signOut();
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(supabaseAuthProvider).initializeAuthListener();
      ref.read(stitchSyncProvider);
      ref.read(hardwareMonitorProvider);
      ref.read(inactivityMonitorProvider); // START INACTIVITY
      ref.read(weatherSentinelProvider); // START WEATHER
      ref.read(emergencyVoiceProvider); // START BLACK BOX PURGE
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'Well-Check Family Shield',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppDarkTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
      builder: (context, child) => SentinelOverlay(child: child!),
    );
  }
}

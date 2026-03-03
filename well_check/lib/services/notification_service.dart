import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:developer' as developer;

class NotificationService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // 1. Request Permissions
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      criticalAlert: true, // IMPORTANT for safety apps
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      developer.log('FCM | Notifications Authorized');

      // 2. Get Token & Sync to Supabase
      await syncTokenToSupabase();

      // 3. Listen for Token Refreshes
      _fcm.onTokenRefresh.listen((newToken) {
        syncTokenToSupabase(token: newToken);
      });

      // 4. Handle Incoming Messages (Foreground)
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        developer.log(
          'SHIELD ALERT | Foreground Message: ${message.notification?.title}',
        );
        // You can use a local notification package here to show a heads-up alert
      });
    }
  }

  static Future<void> syncTokenToSupabase({String? token}) async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final fcmToken = token ?? await _fcm.getToken();
      if (fcmToken == null) return;

      await Supabase.instance.client
          .from('profiles')
          .update({'fcm_token': fcmToken})
          .eq('auth_id', user.id);

      developer.log('FCM | Token synced to Supabase for user: ${user.id}');
    } catch (e) {
      developer.log('FCM | Error syncing token: $e');
    }
  }

  static Future<void> showHighPriorityAlert({
    required String title,
    required String body,
    String type = 'SOS',
  }) async {
    // This method is now used for local logging and potentially
    // triggering a server-side edge function to send the FCM push.
    developer.log("SHIELD ALERT | LOCAL LOG | TITLE: $title | BODY: $body");
  }
}

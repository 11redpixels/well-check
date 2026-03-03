import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/services/consent_tracker.dart';

class FamilyPermissions {
  final bool medsTracking;
  final bool voiceRecording;
  final bool fallDetection;
  final bool weatherAlerts;
  final bool highPriorityAlerts;
  final bool gpsSharing;

  FamilyPermissions({
    this.medsTracking = true,
    this.voiceRecording = false,
    this.fallDetection = true,
    this.weatherAlerts = true,
    this.highPriorityAlerts = true,
    this.gpsSharing = true,
  });

  FamilyPermissions copyWith({
    bool? medsTracking,
    bool? voiceRecording,
    bool? fallDetection,
    bool? weatherAlerts,
    bool? highPriorityAlerts,
    bool? gpsSharing,
  }) {
    return FamilyPermissions(
      medsTracking: medsTracking ?? this.medsTracking,
      voiceRecording: voiceRecording ?? this.voiceRecording,
      fallDetection: fallDetection ?? this.fallDetection,
      weatherAlerts: weatherAlerts ?? this.weatherAlerts,
      highPriorityAlerts: highPriorityAlerts ?? this.highPriorityAlerts,
      gpsSharing: gpsSharing ?? this.gpsSharing,
    );
  }
}

class PermissionsNotifier extends Notifier<FamilyPermissions> {
  @override
  FamilyPermissions build() => FamilyPermissions();

  // Updated to use internal ref
  void updatePermission(String userId, String key, bool value) {
    ref.read(consentLogProvider.notifier).addEntry(userId, key, value);

    state = switch (key) {
      'meds' => state.copyWith(medsTracking: value),
      'voice' => state.copyWith(voiceRecording: value),
      'fall' => state.copyWith(fallDetection: value),
      'weather' => state.copyWith(weatherAlerts: value),
      'priority' => state.copyWith(highPriorityAlerts: value),
      'gps' => state.copyWith(gpsSharing: value),
      _ => state,
    };
  }
}

final permissionsProvider =
    NotifierProvider<PermissionsNotifier, FamilyPermissions>(
      PermissionsNotifier.new,
    );

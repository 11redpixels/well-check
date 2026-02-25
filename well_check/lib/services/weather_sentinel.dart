import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/models/alert_model.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/services/alert_service.dart';
import 'package:well_check/services/consent_tracker.dart';

class WeatherSentinelService {
  final Ref ref;
  Timer? _timer;

  WeatherSentinelService(this.ref);

  void start() {
    _timer = Timer.periodic(const Duration(minutes: 30), (timer) {
      _checkWeatherConditions();
    });
  }

  void _checkWeatherConditions() {
    // PHASE 3: WEATHER SAFETY CHECKS (Simulated)
    const currentTemp = 98.0; // Simulated Heat Wave
    const isStormWarning = true;

    if (currentTemp > 95.0) {
      _triggerHeatAlert(currentTemp);
    }

    if (isStormWarning) {
      _triggerStormCheck();
    }
  }

  void _triggerHeatAlert(double temp) {
    final members = ref.read(familyProvider);
    final alertService = ref.read(alertServiceProvider);
    final user = ref.read(userProvider);
    final targetMembers = members.where((m) => m.role == UserRole.protected).toList();

    for (final member in targetMembers) {
      ref
          .read(consentTrackerProvider)
          .logPermissionChange('system', 'WEATHER_HEAT_ALERT', true);
      ref
          .read(familyProvider.notifier)
          .updateMemberStatus(member.id, 'Heat Wave Alert: Stay Hydrated');
      
      alertService.triggerAlert(
        profileId: member.id,
        familyId: user.familyId ?? '',
        type: AlertType.weather,
        message: 'Dangerous heat detected: $temp°F',
        severity: AlertSeverity.medium,
      );
    }
  }

  void _triggerStormCheck() {
    final members = ref.read(familyProvider);
    final alertService = ref.read(alertServiceProvider);
    final user = ref.read(userProvider);
    final monitors = members.where((m) => m.role == UserRole.monitor).toList();

    ref
        .read(consentTrackerProvider)
        .logPermissionChange('system', 'WEATHER_STORM_ALERT', true);

    for (final monitor in monitors) {
      alertService.triggerAlert(
        profileId: monitor.id,
        familyId: user.familyId ?? '',
        type: AlertType.weather,
        message: 'Storm warning active for your area.',
        severity: AlertSeverity.low,
      );
    }
  }

  void stop() => _timer?.cancel();
}

final weatherSentinelProvider = Provider<WeatherSentinelService>((ref) {
  final service = WeatherSentinelService(ref);
  service.start();
  return service;
});

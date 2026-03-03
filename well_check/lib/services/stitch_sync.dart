import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/models/alert_model.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/providers/settings_provider.dart';
import 'package:well_check/services/alert_service.dart';
import 'package:well_check/services/consent_tracker.dart';

class NudgeNotifier extends Notifier<Map<String, bool>> {
  @override
  Map<String, bool> build() => {};
  void setNudge(String memberId, bool value) =>
      state = {...state, memberId: value};
}

final nudgeProvider = NotifierProvider<NudgeNotifier, Map<String, bool>>(
  NudgeNotifier.new,
);

class OfflineNotifier extends Notifier<bool> {
  @override
  bool build() => false;
  void toggle(bool val) => state = val;
}

final isOfflineProvider = NotifierProvider<OfflineNotifier, bool>(
  OfflineNotifier.new,
);

class StitchSyncService {
  final Ref ref;
  Timer? _timer;
  final Random _random = Random();
  int _lastHardBrakeTime = 0;
  Timer? _smsFallbackTimer;

  StitchSyncService(this.ref);

  void start() {
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!ref.read(isOfflineProvider)) {
        _nudgeData();
      }
    });
  }

  void _nudgeData() {
    final members = ref.read(familyProvider);
    final notifier = ref.read(familyProvider.notifier);
    final settings = ref.read(settingsProvider);
    final alertService = ref.read(alertServiceProvider);
    final user = ref.read(userProvider);

    for (final m in members) {
      if (!m.isAuthorized) continue; // Skip unauthorized members

      if (m.role == UserRole.protected) {
        final now = DateTime.now();
        final hasFallen = _random.nextDouble() > 0.98;

        if (hasFallen) {
          if (!kIsWeb) HapticFeedback.vibrate();
          _startSMSFallbackCountdown(
            '${m.name} detected potential fall.',
            m.name,
          );
          notifier.updateMemberStatus(
            m.id,
            'POTENTIAL FALL DETECTED',
            auraColor: '0xFFFF4444',
          );
          alertService.triggerAlert(
            profileId: m.id,
            familyId: user.familyId ?? '',
            type: AlertType.fall,
            message: 'Fall sensor triggered for ${m.name}',
            severity: AlertSeverity.critical,
          );
          continue;
        }

        final diff = now.difference(m.lastUpdated);
        final willDisconnect = _random.nextDouble() > 0.95;
        final isStale = diff.inMinutes >= 5 || willDisconnect;

        if (isStale) {
          notifier.updateMemberStatus(
            m.id,
            'Connection Stale',
            auraColor: '0xFF94A3B8',
          );
          continue;
        }

        final newHr = 70 + _random.nextInt(40);
        final isHighHr = newHr > settings.hrAlertThreshold;
        notifier.logVitals(m.id, newHr.toString(), '120/80'); // Mock BP for now
        notifier.updateMemberStatus(
          m.id,
          'Stable',
          auraColor: isHighHr ? '0xFFF59E0B' : '0xFF0D9488',
        );

        if (isHighHr) {
          alertService.triggerAlert(
            profileId: m.id,
            familyId: user.familyId ?? '',
            type: AlertType.heartRate,
            message: 'High Heart Rate detected: $newHr bpm',
            severity: AlertSeverity.high,
          );
        }
      }

      if (m.role == UserRole.minor) {
        final newSpeed = 55 + _random.nextInt(45);
        final isSpeeding = newSpeed > settings.speedLimit;
        final isHardBraking = _random.nextDouble() > 0.85;
        if (isHardBraking) {
          _lastHardBrakeTime = DateTime.now().millisecondsSinceEpoch;
        }
        final isErratic =
            isSpeeding &&
            (DateTime.now().millisecondsSinceEpoch - _lastHardBrakeTime <
                60000);

        if (isErratic && !kIsWeb) HapticFeedback.heavyImpact();

        notifier.updateMemberStatus(
          m.id,
          isErratic ? 'ERRATIC DRIVING' : (isSpeeding ? 'SPEEDING' : 'Driving'),
          auraColor: isErratic ? '0xFFFF4444' : '0xFFF59E0B',
        );

        if (isSpeeding) {
          alertService.triggerAlert(
            profileId: m.id,
            familyId: user.familyId ?? '',
            type: AlertType.speeding,
            message: 'Speeding detected: $newSpeed mph',
            severity: isErratic ? AlertSeverity.critical : AlertSeverity.medium,
          );
        }
      }
    }
  }

  void _startSMSFallbackCountdown(String alertContext, String memberName) {
    _smsFallbackTimer?.cancel();
    _smsFallbackTimer = Timer(const Duration(seconds: 60), () {
      ref
          .read(consentTrackerProvider)
          .logPermissionChange('system', 'SMS_FALLBACK_TRIGGERED', true);
      debugPrint(
        "TWILIO SMS: 'SHIELD ALERT: $memberName is unresponsive. Call them now.'",
      );
    });
  }

  void cancelSMSFallback() {
    if (_smsFallbackTimer?.isActive ?? false) {
      _smsFallbackTimer?.cancel();
      debugPrint("SMS FALLBACK CANCELLED: Brian acknowledged alert.");
    }
  }

  static void sendNudge(WidgetRef ref, String memberId) {
    HapticFeedback.lightImpact();
    ref.read(nudgeProvider.notifier).setNudge(memberId, true);
    ref.read(familyProvider.notifier).sendCheckIn(memberId);
    Timer(const Duration(seconds: 10), () {
      ref.read(nudgeProvider.notifier).setNudge(memberId, false);
      ref.read(familyProvider.notifier).resolveCheckIn(memberId);
    });
  }

  void stop() {
    _timer?.cancel();
    _smsFallbackTimer?.cancel();
  }
}

final stitchSyncProvider = Provider<StitchSyncService>((ref) {
  final service = StitchSyncService(ref);
  service.start();
  return service;
});

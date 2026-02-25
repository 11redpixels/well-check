import 'dart:async';
import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/models/alert_model.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/services/alert_service.dart';

// TRACKING EMERGENCY FREQUENCY
class EmergencySyncNotifier extends Notifier<bool> {
  @override
  bool build() => false;
  void toggle(bool val) => state = val;
}

final isEmergencySyncActiveProvider =
    NotifierProvider<EmergencySyncNotifier, bool>(EmergencySyncNotifier.new);

class HardwareMonitorService {
  final Ref ref;
  Timer? _timer;
  final Random _random = Random();

  HardwareMonitorService(this.ref);

  void start() {
    _setSyncFrequency(false);
  }

  void _setSyncFrequency(bool isEmergency) {
    _timer?.cancel();
    final duration = isEmergency
        ? const Duration(seconds: 5)
        : const Duration(seconds: 30);
    _timer = Timer.periodic(duration, (timer) => _checkHardwareStatus());
  }

  void toggleEmergencyMode(bool active) {
    ref.read(isEmergencySyncActiveProvider.notifier).toggle(active);
    _setSyncFrequency(active);
  }

  void _checkHardwareStatus() {
    final members = ref.read(familyProvider);
    final notifier = ref.read(familyProvider.notifier);
    final alertService = ref.read(alertServiceProvider);
    final user = ref.read(userProvider);

    // TARGET ALL PROTECTED/MANAGED MEMBERS
    final targetMembers = members
        .where((m) => m.role == UserRole.protected || m.role == UserRole.minor)
        .toList();

    for (final member in targetMembers) {
      final newBattery = member.batteryLevel - 1;
      final isLowBattery = newBattery < 15;
      final gpsStatus = _random.nextDouble() > 0.9 ? 'Unreliable' : 'High';
      final hasWarning = isLowBattery || gpsStatus == 'Unreliable';

      // Update Supabase instead of local mock update
      notifier.updateMemberStatus(
        member.id,
        isLowBattery ? 'LOW BATTERY' : 'Stable',
        auraColor: hasWarning ? '0xFFF59E0B' : '0xFF0D9488',
      );

      if (isLowBattery) {
        alertService.triggerAlert(
          profileId: member.id,
          familyId: user.familyId ?? '',
          type: AlertType.battery,
          message: 'Critical Battery Level: $newBattery%',
          severity: AlertSeverity.high,
        );
      }
    }
  }

  void stop() => _timer?.cancel();
}

final hardwareMonitorProvider = Provider<HardwareMonitorService>((ref) {
  final service = HardwareMonitorService(ref);
  service.start();
  return service;
});

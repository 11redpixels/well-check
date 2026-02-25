import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/models/alert_model.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/services/alert_service.dart';
import 'package:well_check/services/consent_tracker.dart';

class InactivityMonitorService {
  final Ref ref;
  Timer? _timer;
  int _inactiveIntervals = 0;

  InactivityMonitorService(this.ref);

  void start() {
    _timer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _checkInactivity();
    });
  }

  void _checkInactivity() {
    _inactiveIntervals++;
    if (_inactiveIntervals >= 5) {
      _triggerWellnessChecks();
      _inactiveIntervals = 0;
    }
  }

  void _triggerWellnessChecks() {
    final members = ref.read(familyProvider);
    final alertService = ref.read(alertServiceProvider);
    final user = ref.read(userProvider);
    final targets = members.where((m) => m.role == UserRole.protected).toList();

    for (final target in targets) {
      ref
          .read(consentTrackerProvider)
          .logPermissionChange('system', 'INACTIVITY_TRIGGER', true);
      ref
          .read(familyProvider.notifier)
          .updateMemberStatus(target.id, 'Inactive - Check Connection');
      
      alertService.triggerAlert(
        profileId: target.id,
        familyId: user.familyId ?? '',
        type: AlertType.inactivity,
        message: 'No movement detected recently.',
        severity: AlertSeverity.medium,
      );
    }
  }

  void stop() => _timer?.cancel();
}

final inactivityMonitorProvider = Provider<InactivityMonitorService>((ref) {
  final service = InactivityMonitorService(ref);
  service.start();
  return service;
});

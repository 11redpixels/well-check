import 'package:flutter_test/flutter_test.dart';
import 'package:well_check/services/alert_service.dart';
import 'package:well_check/models/alert_model.dart';

void main() {
  group('AlertService', () {
    late AlertService alertService;

    setUp(() {
      alertService = AlertService();
    });

    test('Should trigger an alert and emit it via stream', () async {
      final expectation = expectLater(
        alertService.alertStream,
        emits(isA<Alert>().having((a) => a.message, 'message', 'Test Alert')),
      );

      await alertService.triggerAlert(
        profileId: 'profile-123',
        familyId: 'family-456',
        type: AlertType.manual,
        severity: AlertSeverity.medium,
        message: 'Test Alert',
      );

      await expectation;
    });
  });
}

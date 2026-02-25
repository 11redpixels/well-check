import 'package:flutter_test/flutter_test.dart';
import 'package:well_check/models/alert_model.dart';

void main() {
  group('Alert Model', () {
    final alertMap = {
      'id': '550e8400-e29b-41d4-a716-446655440000',
      'family_id': 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'profile_id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'type': 'heart_rate',
      'severity': 'high',
      'message': 'High heart rate detected',
      'metadata': {'hr': 145},
      'is_resolved': false,
      'created_at': '2026-02-25T14:30:00.000Z',
    };

    test('Should create Alert from JSON', () {
      final alert = Alert.fromJson(alertMap);

      expect(alert.id, '550e8400-e29b-41d4-a716-446655440000');
      expect(alert.familyId, 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
      expect(alert.profileId, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(alert.type, AlertType.heartRate);
      expect(alert.severity, AlertSeverity.high);
      expect(alert.message, 'High heart rate detected');
      expect(alert.metadata?['hr'], 145);
      expect(alert.isResolved, false);
      expect(alert.createdAt.isUtc, true);
    });

    test('Should convert Alert to JSON', () {
      final alert = Alert(
        id: '550e8400-e29b-41d4-a716-446655440000',
        familyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        profileId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        type: AlertType.heartRate,
        severity: AlertSeverity.high,
        message: 'High heart rate detected',
        metadata: {'hr': 145},
        isResolved: false,
        createdAt: DateTime.parse('2026-02-25T14:30:00.000Z').toUtc(),
      );

      final json = alert.toJson();

      expect(json['id'], alert.id);
      expect(json['type'], 'heart_rate');
      expect(json['severity'], 'high');
      expect(json['metadata']['hr'], 145);
    });
  });
}

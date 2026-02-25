import 'dart:async';
import 'package:well_check/models/alert_model.dart';
import 'package:uuid/uuid.dart';

class AlertService {
  final _alertController = StreamController<Alert>.broadcast();
  final _uuid = const Uuid();

  Stream<Alert> get alertStream => _alertController.stream;

  Future<void> triggerAlert({
    required String profileId,
    required String familyId,
    required AlertType type,
    required AlertSeverity severity,
    required String message,
    Map<String, dynamic>? metadata,
  }) async {
    final alert = Alert(
      id: _uuid.v4(),
      familyId: familyId,
      profileId: profileId,
      type: type,
      severity: severity,
      message: message,
      metadata: metadata,
      createdAt: DateTime.now().toUtc(),
    );

    _alertController.add(alert);
  }

  void dispose() {
    _alertController.close();
  }
}

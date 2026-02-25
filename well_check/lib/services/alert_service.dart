import 'dart:async';
import 'package:well_check/models/alert_model.dart';
import 'package:uuid/uuid.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:well_check/services/logger_service.dart';

class AlertService {
  final SupabaseClient _supabase;
  final _alertController = StreamController<Alert>.broadcast();
  final _uuid = const Uuid();
  
  // Cache for deduplication: key is "profileId:type", value is last triggered timestamp
  final Map<String, DateTime> _lastTriggeredCache = {};
  static const Duration _deduplicationWindow = Duration(minutes: 1);

  AlertService(this._supabase);

  Stream<Alert> get alertStream => _alertController.stream;

  Future<void> triggerAlert({
    required String profileId,
    required String familyId,
    required AlertType type,
    required AlertSeverity severity,
    required String message,
    Map<String, dynamic>? metadata,
  }) async {
    final cacheKey = '$profileId:${type.name}';
    final now = DateTime.now().toUtc();
    
    if (_lastTriggeredCache.containsKey(cacheKey)) {
      final lastTriggered = _lastTriggeredCache[cacheKey]!;
      if (now.difference(lastTriggered) < _deduplicationWindow) {
        ShieldLogger.d("Deduplicating alert $type for $profileId");
        return;
      }
    }

    _lastTriggeredCache[cacheKey] = now;

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

    await _supabase.from('alerts').insert(alert.toJson());
  }

  void dispose() {
    _alertController.close();
  }
}

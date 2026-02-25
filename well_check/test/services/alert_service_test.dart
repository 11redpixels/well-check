import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:well_check/services/alert_service.dart';
import 'package:well_check/models/alert_model.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MockSupabaseClient extends Mock implements SupabaseClient {}
class MockSupabaseQueryBuilder extends Mock implements SupabaseQueryBuilder {}

class FakePostgrestFilterBuilder extends Fake implements PostgrestFilterBuilder<List<Map<String, dynamic>>> {
  @override
  Future<R> then<R>(FutureOr<R> Function(List<Map<String, dynamic>> value) onValue, {Function? onError}) {
    return Future.value(onValue([]));
  }
}

void main() {
  group('AlertService', () {
    late AlertService alertService;
    late MockSupabaseClient mockSupabase;
    late MockSupabaseQueryBuilder mockQueryBuilder;

    setUp(() {
      mockSupabase = MockSupabaseClient();
      mockQueryBuilder = MockSupabaseQueryBuilder();

      when(() => mockSupabase.from(any())).thenAnswer((_) => mockQueryBuilder);
      when(() => mockQueryBuilder.insert(any())).thenAnswer((_) => FakePostgrestFilterBuilder());
      
      alertService = AlertService(mockSupabase);
    });

    test('Should trigger an alert, emit it via stream, and persist to Supabase', () async {
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

      verify(() => mockSupabase.from('alerts')).called(1);
      verify(() => mockQueryBuilder.insert(any())).called(1);
    });
  });
}

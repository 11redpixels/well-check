import 'package:flutter_riverpod/flutter_riverpod.dart';

class MedicalRecord {
  final List<String> allergies;
  final List<String> chronicConditions;
  final List<String> legalDirectives;
  final Map<String, String> insuranceInfo;

  MedicalRecord({
    required this.allergies,
    required this.chronicConditions,
    required this.legalDirectives,
    required this.insuranceInfo,
  });
}

class MedicalNotifier extends Notifier<MedicalRecord> {
  @override
  MedicalRecord build() {
    return MedicalRecord(
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
      legalDirectives: [
        'DNR (Do Not Resuscitate)',
        'Healthcare Power of Attorney',
      ],
      insuranceInfo: {
        'provider': 'Standard Health Shield',
        'policyNumber': 'MS-992-XXXX',
        'group': 'FAMILY-SHIELD-V1',
      },
    );
  }
}

final medicalProvider = NotifierProvider<MedicalNotifier, MedicalRecord>(
  MedicalNotifier.new,
);

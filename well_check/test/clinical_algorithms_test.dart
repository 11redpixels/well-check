import 'package:flutter_test/flutter_test.dart';
import 'package:well_check/utils/clinical_algorithms.dart';

void main() {
  group('Blood Pressure Validation', () {
    test('Should flag Hypertension Stage 2 for 140/90', () {
      expect(
        ClinicalAlgorithms.calculateHypertensionStage(140, 90),
        "Hypertension Stage 2",
      );
    });

    test('Should flag Hypertension Stage 1 for 135/85', () {
      expect(
        ClinicalAlgorithms.calculateHypertensionStage(135, 85),
        "Hypertension Stage 1",
      );
    });

    test('Should return Normal for 115/75', () {
      expect(ClinicalAlgorithms.calculateHypertensionStage(115, 75), "Normal");
    });
  });

  group('PHQ-2 Depression Screening', () {
    test('Should flag intervention for score of 3', () {
      expect(ClinicalAlgorithms.phq2RequiresIntervention(1, 2), true);
    });

    test('Should not flag intervention for score of 2', () {
      expect(ClinicalAlgorithms.phq2RequiresIntervention(1, 1), false);
    });

    test('Should flag critical intervention for max score of 6', () {
      expect(ClinicalAlgorithms.phq2RequiresIntervention(3, 3), true);
    });
  });
}

import 'package:well_check/utils/clinical_algorithms.dart';

void main() {
  print("--- STARTING STANDALONE CLINICAL VALIDATION ---");

  // 1. Blood Pressure Tests
  _testBP(140, 90, "Hypertension Stage 2");
  _testBP(130, 80, "Hypertension Stage 1");
  _testBP(125, 75, "Elevated");
  _testBP(115, 75, "Normal");

  // 2. PHQ-2 Tests
  _testPHQ2(1, 2, true); // Score 3
  _testPHQ2(1, 1, false); // Score 2
  _testPHQ2(3, 3, true); // Score 6

  print("--- ALL STANDALONE TESTS PASSED SUCCESSFULLY ---");
}

void _testBP(int sys, int dia, String expected) {
  final result = ClinicalAlgorithms.calculateHypertensionStage(sys, dia);
  if (result == expected) {
    print("[PASS] BP $sys/$dia => $result");
  } else {
    print("[FAIL] BP $sys/$dia => Expected $expected, but got $result");
    throw Exception("BP Validation Failed");
  }
}

void _testPHQ2(int q1, int q2, bool expected) {
  final result = ClinicalAlgorithms.phq2RequiresIntervention(q1, q2);
  if (result == expected) {
    print("[PASS] PHQ2 ($q1, $q2) => Intervention: $result");
  } else {
    print("[FAIL] PHQ2 ($q1, $q2) => Expected $expected, but got $result");
    throw Exception("PHQ2 Validation Failed");
  }
}

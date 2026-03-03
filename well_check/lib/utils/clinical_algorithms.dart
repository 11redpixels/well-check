class ClinicalAlgorithms {
  /// Calculates the Hypertension stage based on AHA guidelines.
  static String calculateHypertensionStage(int systolic, int diastolic) {
    if (systolic >= 140 || diastolic >= 90) return "Hypertension Stage 2";
    if (systolic >= 130 || diastolic >= 80) return "Hypertension Stage 1";
    if (systolic >= 120 && diastolic < 80) return "Elevated";
    return "Normal";
  }

  /// PHQ-2 Screening logic.
  /// Score of 3 or greater is the clinical threshold for MDD screening.
  static bool phq2RequiresIntervention(int q1, int q2) {
    return (q1 + q2) >= 3;
  }
}

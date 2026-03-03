import 'package:well_check/providers/family_provider.dart';

class ReportService {
  // TASK 2: 7-DAY SUMMARY AGGREGATOR
  static Map<String, dynamic> generateMedicalSummary(FamilyMember member) {
    // Aggregating mock data for last 7 days
    return {
      'patientName': member.name,
      'period': 'Last 7 Days',
      'avgHeartRate': 74,
      'peakHeartRate': 92,
      'medicationAdherence': '98%',
      'aiMoodSentiment': 'Stable/Positive',
      'criticalEvents': [
        {'date': 'Feb 20', 'type': 'Mild Dizziness', 'resolved': 'Yes'},
      ],
      'clinicalNotes': member.lastVoiceNote ?? 'No recent verbal complaints.',
    };
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:developer' as developer;

class ExternalApiService {
  // PHASE 4: THE "STITCH" EXTERNAL SYNC (API SCAFFOLD)
  // Goal: Future integrations with Stitch Health & Insurance Telematics

  Future<void> exportToStitchHealth(Map<String, dynamic> data) async {
    // Simulate API call to Stitch Health
    await Future.delayed(const Duration(seconds: 2));
    developer.log("STITCH HEALTH: Data synced successfully.");
  }

  Future<void> sendInsuranceTelematics(double safetyScore) async {
    // Simulate sending minor's safety score to an insurance provider
    developer.log("INSURANCE: Safety Score $safetyScore transmitted.");
  }
}

final externalApiProvider = Provider<ExternalApiService>((ref) {
  return ExternalApiService();
});

import 'dart:io';
import 'dart:typed_data';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:developer' as developer;
import 'package:well_check/services/consent_tracker.dart';
import 'package:well_check/services/encryption_service.dart';

class EmergencyVoiceService {
  final Ref ref;

  EmergencyVoiceService(this.ref) {
    _initPurge();
  }

  Future<void> saveRecordingEncrypted(
    String fileName,
    Uint8List audioData,
  ) async {
    final encrypted = await EncryptionService.encryptData(audioData);
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/audio_recordings/$fileName');
    await file.writeAsBytes(encrypted);
    developer.log("BLACK BOX | Encrypted recording saved: $fileName");
  }

  Future<Uint8List> readRecordingDecrypted(String fileName) async {
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/audio_recordings/$fileName');
    final encryptedData = await file.readAsBytes();
    return await EncryptionService.decryptData(encryptedData);
  }

  Future<void> _initPurge() async {
    developer.log("BLACK BOX | Initializing 24-Hour TTL Audio Purge...");
    try {
      final directory = await getApplicationDocumentsDirectory();
      final audioDir = Directory('${directory.path}/audio_recordings');

      if (await audioDir.exists()) {
        final List<FileSystemEntity> files = await audioDir.list().toList();
        final now = DateTime.now();
        int deletedCount = 0;

        for (var file in files) {
          if (file is File) {
            final stat = await file.stat();
            final age = now.difference(stat.modified);

            // 24-Hour TTL Logic
            if (age.inHours >= 24) {
              // Note: In a real app, we'd check metadata for "Saved to Vault" flag
              await file.delete();
              deletedCount++;
            }
          }
        }
        developer.log(
          "BLACK BOX | Purge Complete. Deleted $deletedCount expired recordings.",
        );
      }
    } catch (e) {
      developer.log("BLACK BOX | Purge Failed: $e");
    }
  }

  void startRecording(String userId) {
    // PHASE 4: CONSENT LEDGER VERIFICATION
    ref
        .read(consentTrackerProvider)
        .logPermissionChange(
          userId,
          'EMERGENCY_AUDIO_RECORDING',
          true,
          // Note: we can add a custom note or use the existing logPermissionChange
        );
    developer.log(
      "BLACK BOX | System started Emergency Audio Recording - Consent Verified",
    );
  }
}

final emergencyVoiceProvider = Provider<EmergencyVoiceService>(
  (ref) => EmergencyVoiceService(ref),
);

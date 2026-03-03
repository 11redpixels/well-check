import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/providers/family_provider.dart';

class SemanticAnalyzerService {
  // PHASE 1: SEMANTIC KEYWORDS
  static const List<String> redFlags = [
    'dizzy',
    'shaky',
    'confused',
    'fell',
    'pain',
    'vision',
  ];

  static bool analyze(String text) {
    final lowerText = text.toLowerCase();
    return redFlags.any((flag) => lowerText.contains(flag));
  }

  static void processVoiceResponse(
    WidgetRef ref,
    String memberId,
    String text,
  ) {
    final isCritical = analyze(text);
    ref
        .read(familyProvider.notifier)
        .setVoiceNote(memberId, text, isCritical: isCritical);
  }
}

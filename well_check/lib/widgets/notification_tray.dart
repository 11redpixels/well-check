import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/family_provider.dart';

class NotificationTray extends ConsumerWidget {
  const NotificationTray({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final members = ref.watch(familyProvider);
    final voiceLogs = ref.watch(voiceLogProvider);
    final hasAnyWarning = members.any((m) => m.hasWarning);
    final hasVoiceUpdate = voiceLogs.isNotEmpty;

    return Container(
      width: 54,
      height: 54,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          const Icon(
            Icons.notifications_outlined,
            color: Color(0xFF0F172A),
            size: 28,
          ),
          if (hasAnyWarning || hasVoiceUpdate)
            Positioned(
              top: 14,
              right: 14,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: hasAnyWarning
                      ? const Color(0xFFFF4444)
                      : const Color(0xFF0D9488),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

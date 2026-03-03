import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/family_metadata_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/services/stitch_sync.dart';
import 'privacy_settings.dart';

class MemberHomeView extends ConsumerWidget {
  const MemberHomeView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final familyAsync = ref.watch(currentFamilyProvider);
    final nudges = ref.watch(nudgeProvider);
    final isNudged = nudges[user.id] ?? false;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _header(user.firstName ?? 'Member'),
                const SizedBox(height: 16),

                // FAMILY BADGE
                familyAsync.when(
                  data: (family) => Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D9488).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.verified_user_rounded,
                          color: Color(0xFF0D9488),
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "Connected to ${family?.name ?? 'Shield Network'}",
                          style: const TextStyle(
                            color: Color(0xFF0D9488),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  loading: () => const SizedBox.shrink(),
                  error: (error, stack) => const SizedBox.shrink(),
                ),

                const SizedBox(height: 32),

                // PHASE 1: THE EMOTIONAL PULSE
                if (user.id != null) _dailyPulseCard(context, ref, user.id!),

                const SizedBox(height: 40),
                _connectionIndicator(),
                const SizedBox(height: 40),
                const PrivacySettingsView(),
                const SizedBox(height: 64),
                _emergencyBeacon(context, ref, user.id ?? 'member'),
              ],
            ),
          ),
          if (isNudged) NudgeResponseOverlay(memberId: user.id ?? 'member'),
        ],
      ),
    );
  }

  Widget _header(String name) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Hello, $name.",
          style: GoogleFonts.oswald(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          "Your Safety Shield is active.",
          style: TextStyle(
            fontSize: 16,
            color: Color(0xFF64748B),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _dailyPulseCard(BuildContext context, WidgetRef ref, String memberId) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Daily Pulse",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 8),
          const Text(
            "How are you feeling today?",
            style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _moodEmoji(ref, memberId, 1, "😫", Colors.red),
              _moodEmoji(ref, memberId, 2, "😔", Colors.orange),
              _moodEmoji(ref, memberId, 3, "😐", Colors.amber),
              _moodEmoji(ref, memberId, 4, "😊", Colors.lightGreen),
              _moodEmoji(ref, memberId, 5, "🤩", const Color(0xFF0D9488)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _moodEmoji(
    WidgetRef ref,
    String memberId,
    int score,
    String emoji,
    Color color,
  ) {
    return GestureDetector(
      onTap: () {
        ref.read(familyProvider.notifier).updateMood(memberId, score);
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Text(emoji, style: const TextStyle(fontSize: 24)),
      ),
    );
  }

  Widget _connectionIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
          ),
        ],
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.circle, color: Color(0xFF0D9488), size: 10),
          SizedBox(width: 12),
          Text(
            "Live Connection Active",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _emergencyBeacon(BuildContext context, WidgetRef ref, String id) {
    return Column(
      children: [
        const Text(
          "Need help but not a 911 emergency?",
          style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F172A),
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 64),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Emergency Beacon Sent to Family.")),
            );
          },
          child: const Text(
            "SEND HELP (SILENT BEACON)",
            style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.0),
          ),
        ),
      ],
    );
  }
}

class NudgeResponseOverlay extends ConsumerWidget {
  final String memberId;
  const NudgeResponseOverlay({super.key, required this.memberId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      color: const Color(0xFF0F172A),
      width: double.infinity,
      height: double.infinity,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.notifications_active_rounded,
            color: Color(0xFF3B82F6),
            size: 100,
          ),
          const SizedBox(height: 48),
          Text(
            "The family is checking in.",
            style: GoogleFonts.oswald(
              fontSize: 40,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          const Text(
            "Are you okay?",
            style: TextStyle(color: Colors.white70, fontSize: 24),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 80),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D9488),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 100),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(32),
              ),
            ),
            onPressed: () {
              ref.read(nudgeProvider.notifier).setNudge(memberId, false);
              ref.read(familyProvider.notifier).resolveCheckIn(memberId);
            },
            child: const Text(
              "I'M OKAY",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(height: 32),
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF3B82F6),
              side: const BorderSide(color: Color(0xFF3B82F6), width: 3),
              minimumSize: const Size(double.infinity, 80),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            onPressed: () {},
            child: const Text(
              "CALL FAMILY",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
            ),
          ),
        ],
      ),
    );
  }
}

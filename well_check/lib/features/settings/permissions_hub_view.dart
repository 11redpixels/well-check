import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:well_check/providers/permissions_provider.dart';
import 'package:well_check/providers/user_provider.dart';

class PermissionsHubView extends ConsumerWidget {
  const PermissionsHubView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final perms = ref.watch(permissionsProvider);
    final user = ref.watch(userProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded),
                ),
                const SizedBox(width: 8),
                Text(
                  "Safety Hub",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Text(
              "Manage granular privacy and protection settings.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 40),

            _permTile(
              ref,
              user.id ?? 'admin',
              "Medication Tracking",
              "Allows the AI to confirm daily intake.",
              perms.medsTracking,
              'meds',
            ),
            _permTile(
              ref,
              user.id ?? 'admin',
              "Voice Recording",
              "Enables emergency audio logs & AI semantic check.",
              perms.voiceRecording,
              'voice',
            ),
            _permTile(
              ref,
              user.id ?? 'admin',
              "Fall Detection",
              "Monitors device accelerometer for impact spikes.",
              perms.fallDetection,
              'fall',
            ),
            _permTile(
              ref,
              user.id ?? 'admin',
              "Weather Alerts",
              "Notifies if nursery temp/humidity exceeds limits.",
              perms.weatherAlerts,
              'weather',
            ),
            _permTile(
              ref,
              user.id ?? 'admin',
              "High-Priority Alerts",
              "Bypass DND for critical family emergencies.",
              perms.highPriorityAlerts,
              'priority',
            ),
            _permTile(
              ref,
              user.id ?? 'admin',
              "GPS Sharing",
              "Real-time location & breadcrumb trails.",
              perms.gpsSharing,
              'gps',
            ),

            const SizedBox(height: 32),
            InkWell(
              onTap: () => context.push('/consent-ledger'),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 20,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.history_edu_rounded,
                      color: Color(0xFF0D9488),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "View Consent Ledger",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            "Audit history of all permission changes.",
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 16,
                      color: Color(0xFF94A3B8),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 48),
            _disclaimer(),
          ],
        ),
      ),
    );
  }

  Widget _permTile(
    WidgetRef ref,
    String userId,
    String title,
    String why,
    bool value,
    String key,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              Switch(
                value: value,
                activeThumbColor: const Color(0xFF0D9488),
                onChanged: (val) => ref
                    .read(permissionsProvider.notifier)
                    .updatePermission(userId, key, val),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(
                Icons.help_outline_rounded,
                size: 14,
                color: Color(0xFF94A3B8),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  why,
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _disclaimer() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Text(
        "⚖️ DISCLAIMER: Well-Check is a monitoring tool. Information displayed is for situational awareness and does not constitute professional medical advice or emergency dispatch services.",
        style: TextStyle(
          color: Color(0xFF64748B),
          fontSize: 12,
          height: 1.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

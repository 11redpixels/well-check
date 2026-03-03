import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/providers/family_provider.dart';

class StatusView extends ConsumerWidget {
  const StatusView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final members = ref.watch(familyProvider);

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
                  "Deep Sentinel",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Text(
              "Real-time hardware health and sync frequency.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 32),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.75,
              ),
              itemCount: members.length,
              itemBuilder: (context, index) =>
                  _deepSentinelCard(members[index]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _deepSentinelCard(FamilyMember m) {
    final isLowBattery = m.batteryLevel < 20;
    final batteryColor = isLowBattery
        ? const Color(0xFFFF4444)
        : const Color(0xFF0D9488);

    return Container(
      padding: const EdgeInsets.all(20),
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
          CircleAvatar(
            backgroundColor: const Color(0xFFF1F5F9),
            child: Text(m.name[0]),
          ),
          const SizedBox(height: 12),
          Text(
            m.name.split(' ')[0],
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const Spacer(),
          _deepStat(Icons.bolt_rounded, "${m.batteryLevel}%", batteryColor),
          _deepStat(Icons.timer_rounded, "Sync: 30s", const Color(0xFF3B82F6)),
          _deepStat(
            Icons.watch_rounded,
            m.role == UserRole.protected ? "Wearable Sensor" : "Phone GPS",
            const Color(0xFF94A3B8),
          ),
        ],
      ),
    );
  }

  Widget _deepStat(IconData icon, String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

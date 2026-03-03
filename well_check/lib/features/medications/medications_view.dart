import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/family_provider.dart';

import 'package:well_check/models/user_role.dart';

class MedicationsView extends ConsumerWidget {
  const MedicationsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final members = ref.watch(familyProvider);
    final targetMembers = members
        .where((m) => m.role == UserRole.protected || m.role == UserRole.minor)
        .toList();

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
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  "Medication Hub",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const Text(
              "Track and confirm daily clinical adherence.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 48),

            if (targetMembers.isEmpty)
              const Center(child: Text("No members with prescriptions found."))
            else
              ...targetMembers.map(
                (member) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionHeader("${member.name}'s Prescriptions"),
                    ...member.prescriptions.map(
                      (p) => _medCard(context, ref, member.id, p),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF64748B),
          fontWeight: FontWeight.bold,
          fontSize: 14,
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  Widget _medCard(
    BuildContext context,
    WidgetRef ref,
    String profileId,
    Prescription p,
  ) {
    final isTaken = false; // Check med_logs stream in production

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                p.name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Color(0xFF0F172A),
                ),
              ),
              Text(
                "${p.dosage} • ${p.schedule}",
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
              ),
            ],
          ),
          if (isTaken)
            const Icon(
              Icons.check_circle_rounded,
              color: Color(0xFF0D9488),
              size: 32,
            )
          else
            ElevatedButton(
              onPressed: () {
                HapticFeedback.lightImpact();
                ref
                    .read(familyProvider.notifier)
                    .markMedicationTaken(profileId, p.id ?? '');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Confirm'),
            ),
        ],
      ),
    );
  }
}

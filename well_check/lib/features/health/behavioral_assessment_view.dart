import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/providers/family_provider.dart';

class BehavioralAssessmentView extends ConsumerStatefulWidget {
  const BehavioralAssessmentView({super.key});

  @override
  ConsumerState<BehavioralAssessmentView> createState() =>
      _BehavioralAssessmentViewState();
}

class _BehavioralAssessmentViewState
    extends ConsumerState<BehavioralAssessmentView> {
  int _q1Score = 0;
  int _q2Score = 0;

  @override
  Widget build(BuildContext context) {
    final members = ref.watch(familyProvider);
    final target = members.firstWhere(
      (m) => m.role == UserRole.protected,
      orElse: () => members.first,
    );

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
                  "PHQ-2 Assessment",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            Text(
              "Clinical screening for ${target.name}.",
              style: const TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 48),
            _questionCard(
              "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
              _q1Score,
              (val) => setState(() => _q1Score = val!),
            ),
            const SizedBox(height: 24),
            _questionCard(
              "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
              _q2Score,
              (val) => setState(() => _q2Score = val!),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                final total = _q1Score + _q2Score;
                ref
                    .read(familyProvider.notifier)
                    .setPHQ2Score(target.id, total);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Assessment Scored & Synced to Shield."),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                minimumSize: const Size(double.infinity, 64),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              child: const Text(
                "SUBMIT CLINICAL SCORE",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _questionCard(
    String text,
    int currentVal,
    ValueChanged<int?> onChanged,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            text,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          ...List.generate(4, (index) {
            final labels = [
              "Not at all (0)",
              "Several days (1)",
              "More than half (2)",
              "Nearly every day (3)",
            ];
            return RadioListTile<int>(
              title: Text(labels[index], style: const TextStyle(fontSize: 14)),
              value: index,
              groupValue: currentVal,
              onChanged: onChanged,
              activeColor: const Color(0xFF0D9488),
              contentPadding: EdgeInsets.zero,
            );
          }),
        ],
      ),
    );
  }
}

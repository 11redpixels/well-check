import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';

class VisitorLogView extends ConsumerStatefulWidget {
  const VisitorLogView({super.key});

  @override
  ConsumerState<VisitorLogView> createState() => _VisitorLogViewState();
}

class _VisitorLogViewState extends ConsumerState<VisitorLogView> {
  final _visitorNameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
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
                  "Visitor Check-in",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Text(
              "Log family, nurses, or guests currently with the protected member.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 48),

            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Guest Details",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    controller: _visitorNameController,
                    decoration: InputDecoration(
                      hintText: "Visitor Name (e.g., Nurse Sarah)",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () {
                      final name = _visitorNameController.text;
                      if (name.isNotEmpty) {
                        final members = ref.read(familyProvider);
                        final protected = members.firstWhere(
                          (m) => m.role == UserRole.protected,
                          orElse: () => members.first,
                        );
                        ref
                            .read(familyProvider.notifier)
                            .updateMember(
                              protected.id,
                              (m) => m.copyWith(
                                status: "With Guest: $name",
                                info: "Last Check-in: Just Now",
                              ),
                            );
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              "The family has been notified: ${protected.name} is with $name.",
                            ),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      minimumSize: const Size(double.infinity, 64),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Text(
                      "CHECK-IN GUEST",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

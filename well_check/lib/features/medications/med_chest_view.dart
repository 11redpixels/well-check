import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';

class MedChestView extends ConsumerStatefulWidget {
  const MedChestView({super.key});

  @override
  ConsumerState<MedChestView> createState() => _MedChestViewState();
}

class _MedChestViewState extends ConsumerState<MedChestView> {
  String? _selectedMemberId;
  final _nameController = TextEditingController();
  final _timeController = TextEditingController();
  final _dosageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final members = ref.watch(familyProvider);
    final managedMembers = members
        .where((m) => m.role == UserRole.protected || m.role == UserRole.minor)
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Family Apothecary",
              style: GoogleFonts.oswald(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Text(
              "Manage family prescriptions and schedules.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 40),

            // SELECT MEMBER
            const Text(
              "SELECT MEMBER",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 16),
            _memberSelector(managedMembers),

            if (_selectedMemberId != null) ...[
              const SizedBox(height: 40),
              _prescriptionList(
                managedMembers.firstWhere((m) => m.id == _selectedMemberId),
              ),
              const SizedBox(height: 40),
              _addPrescriptionForm(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _memberSelector(List<FamilyMember> members) {
    return Row(
      children: members
          .map(
            (m) => Padding(
              padding: const EdgeInsets.only(right: 12.0),
              child: ChoiceChip(
                label: Text(m.name.split(' ')[0]),
                selected: _selectedMemberId == m.id,
                onSelected: (val) =>
                    setState(() => _selectedMemberId = val ? m.id : null),
                selectedColor: const Color(0xFF0D9488).withValues(alpha: 0.1),
                labelStyle: TextStyle(
                  color: _selectedMemberId == m.id
                      ? const Color(0xFF0D9488)
                      : const Color(0xFF64748B),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _prescriptionList(FamilyMember member) {
    if (member.prescriptions.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.medication_liquid_rounded,
                color: Color(0xFFEF4444),
                size: 40,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              "No prescriptions found for ${member.name.split(' ')[0]}.",
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Add a medication below to start clinical monitoring and automated reminders.",
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFF64748B),
                fontSize: 14,
                height: 1.4,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "${member.name.toUpperCase()}'S MEDS",
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            color: Color(0xFF94A3B8),
          ),
        ),
        const SizedBox(height: 16),
        ...member.prescriptions.map(
          (p) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
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
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      "${p.dosage} • ${p.schedule}",
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                    ),
                  ],
                ),
                const Icon(Icons.medication_rounded, color: Color(0xFF0D9488)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _addPrescriptionForm() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Add New Prescription",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 24),
          _textField(_nameController, "Medication Name (e.g., Aspirin)"),
          const SizedBox(height: 16),
          _textField(_dosageController, "Dosage (e.g., 100mg)"),
          const SizedBox(height: 16),
          _textField(_timeController, "Time (e.g., 8:00 AM)"),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {
              HapticFeedback.lightImpact(); // LIGHT IMPACT for standard confirmation
              try {
                ref
                    .read(familyProvider.notifier)
                    .addPrescription(
                      _selectedMemberId!,
                      _nameController.text,
                      _timeController.text,
                      _dosageController.text,
                    );
                _nameController.clear();
                _timeController.clear();
                _dosageController.clear();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Prescription synced to Shield"),
                  ),
                );
              } catch (e) {
                // THE GRANDMOTHER TEST: Clear, non-technical error
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text("⚠️ Safety Warning"),
                    content: Text(e.toString().replaceAll("Exception: ", "")),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text("OK"),
                      ),
                    ],
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 60),
            ),
            child: const Text("SAVE TO SHIELD"),
          ),
        ],
      ),
    );
  }

  Widget _textField(TextEditingController controller, String hint) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
    );
  }
}

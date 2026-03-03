import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';

class ContactsView extends ConsumerStatefulWidget {
  const ContactsView({super.key});

  @override
  ConsumerState<ContactsView> createState() => _ContactsViewState();
}

class _ContactsViewState extends ConsumerState<ContactsView>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  String? _activeCalling;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _triggerShieldCall(String name) {
    setState(() => _activeCalling = name);
    _pulseController.repeat(reverse: true);
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        setState(() => _activeCalling = null);
        _pulseController.stop();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final members = ref.watch(familyProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Family Circle",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text(
                  "Secure encrypted audio bridge.",
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 32),

                if (members.isEmpty)
                  const Center(child: Text("No members found."))
                else
                  ...members.map(
                    (m) => _contactItem(
                      m.name,
                      "${m.role.name.toUpperCase()} / ${m.status}",
                      false,
                      isPrimary: m.role == UserRole.protected,
                    ),
                  ),
              ],
            ),
          ),
          if (_activeCalling != null) _buildCallOverlay(),
        ],
      ),
    );
  }

  Widget _buildCallOverlay() {
    return Container(
      color: const Color(0xFF0F172A).withValues(alpha: 0.95),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(
                          0xFF0D9488,
                        ).withValues(alpha: 0.3 * _pulseController.value),
                        blurRadius: 40,
                        spreadRadius: 20,
                      ),
                    ],
                    border: Border.all(
                      color: const Color(0xFF0D9488),
                      width: 4,
                    ),
                  ),
                  child: const Icon(
                    Icons.mic_rounded,
                    color: Color(0xFF0D9488),
                    size: 64,
                  ),
                );
              },
            ),
            const SizedBox(height: 48),
            Text(
              "CALLING $_activeCalling...",
              style: GoogleFonts.oswald(
                color: Colors.white,
                fontSize: 24,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 60),
            IconButton(
              onPressed: () => setState(() => _activeCalling = null),
              icon: const Icon(
                Icons.call_end_rounded,
                color: Color(0xFFFF4444),
                size: 64,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _contactItem(
    String name,
    String role,
    bool hasVideo, {
    bool isEmergency = false,
    bool isPrimary = false,
  }) {
    final color = isEmergency
        ? const Color(0xFFFF4444)
        : (isPrimary ? const Color(0xFF3B82F6) : const Color(0xFF0D9488));
    return InkWell(
      onTap: () => _triggerShieldCall(name),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
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
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: color.withValues(alpha: 0.1),
              child: Text(
                name[0],
                style: TextStyle(color: color, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  Text(
                    role,
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                ],
              ),
            ),
            const Icon(Icons.phone_in_talk_rounded, color: Color(0xFF0D9488)),
          ],
        ),
      ),
    );
  }
}

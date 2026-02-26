import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';
import 'package:well_check/routing/router.dart';

class SentinelOverlay extends ConsumerStatefulWidget {
  final Widget child;
  const SentinelOverlay({super.key, required this.child});

  @override
  ConsumerState<SentinelOverlay> createState() => _SentinelOverlayState();
}

class _SentinelOverlayState extends ConsumerState<SentinelOverlay> {
  bool _isExpanded = false;
  Offset _offset = const Offset(20, 100);

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);
    final voiceLogs = ref.watch(voiceLogProvider);

    return Directionality(
      textDirection: TextDirection.ltr,
      child: Stack(
        children: [
          widget.child,
          Positioned(
            left: _offset.dx,
            top: _offset.dy,
            child: GestureDetector(
              onPanUpdate: (details) {
                setState(() {
                  _offset += details.delta;
                });
              },
              onTap: () => setState(() => _isExpanded = !_isExpanded),
              child: _buildOrb(),
            ),
          ),
          if (_isExpanded)
            Positioned(
              left: 20,
              right: 20,
              top: 100,
              bottom: 100,
              child: _buildPanel(userState, voiceLogs),
            ),
        ],
      ),
    );
  }

  Widget _buildOrb() {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: const Color(0xFF0D9488),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D9488).withValues(alpha: 0.4),
            blurRadius: 15,
            spreadRadius: 2,
          ),
        ],
      ),
      child: const Center(
        child: Text(
          "S",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 20,
          ),
        ),
      ),
    );
  }

  Widget _buildPanel(UserState user, List<String> logs) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withValues(alpha: 0.98),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF0D9488), width: 2),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "GOD-MODE CONSOLE",
                style: GoogleFonts.oswald(
                  color: const Color(0xFF0D9488),
                  fontSize: 18,
                  letterSpacing: 1.5,
                ),
              ),
              IconButton(
                onPressed: () => setState(() => _isExpanded = false),
                icon: const Icon(Icons.close, color: Colors.white54),
              ),
            ],
          ),
          const Divider(color: Colors.white10, height: 24),

          // PHASE 1: ROLE SWITCHER (DEVELOPER TOOL ONLY)
          const Text(
            "PERSONA OVERRIDE",
            style: TextStyle(
              color: Colors.white54,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            "Real members will appear here once authenticated.",
            style: TextStyle(color: Colors.white38, fontSize: 10),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _personaTag("FAMILY HEAD", UserRole.familyHead, 'admin'),
              _personaTag("PROTECTED", UserRole.protected, 'protected'),
              _personaTag("MONITOR", UserRole.monitor, 'monitor'),
              _personaTag("MINOR", UserRole.minor, 'minor'),
            ],
          ),

          const SizedBox(height: 24),
          _infoRow("STATE", "Persona: ${user.id ?? 'None'}"),
          _infoRow(
            "AUTH",
            "Status: ${user.isAuthenticated ? 'VERIFIED' : 'GUEST'}",
          ),

          const SizedBox(height: 20),
          const Text(
            "RAW SEMANTIC LOGS",
            style: TextStyle(
              color: Colors.white54,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black26,
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListView.builder(
                itemCount: logs.length,
                itemBuilder: (context, index) => Padding(
                  padding: const EdgeInsets.only(bottom: 4.0),
                  child: Text(
                    "> ${logs[logs.length - 1 - index]}",
                    style: GoogleFonts.robotoMono(
                      color: const Color(0xFF22D3EE),
                      fontSize: 10,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _personaTag(String label, UserRole role, String id) {
    final user = ref.watch(userProvider);
    final isCurrent = user.id == id;

    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact(); // MEDIUM IMPACT for Role Switch
        ref.read(userProvider.notifier).setRole(role, id: id);
        setState(() => _isExpanded = false);

        // AUTO-NAVIGATE TO APPROPRIATE HOME SHELL
        if (role == UserRole.familyHead) {
          ref.read(routerProvider).go('/family-head');
        } else if (role == UserRole.protected) {
          ref.read(routerProvider).go('/elder-home');
        } else if (role == UserRole.minor) {
          ref.read(routerProvider).go('/member-home');
        } else if (role == UserRole.monitor) {
          ref.read(routerProvider).go('/family-head');
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isCurrent ? const Color(0xFF0D9488) : Colors.white10,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isCurrent ? Colors.white24 : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isCurrent ? Colors.white : Colors.white54,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        children: [
          Text(
            "$label: ",
            style: const TextStyle(
              color: Color(0xFF0D9488),
              fontWeight: FontWeight.bold,
              fontSize: 11,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.white70, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }
}

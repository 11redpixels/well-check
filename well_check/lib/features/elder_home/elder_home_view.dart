import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/providers/user_provider.dart';
import 'package:well_check/services/semantic_analyzer.dart';

class ElderHomeView extends ConsumerStatefulWidget {
  const ElderHomeView({super.key});

  @override
  ConsumerState<ElderHomeView> createState() => _ElderHomeViewState();
}

class _ElderHomeViewState extends ConsumerState<ElderHomeView>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isProcessingVoice = false;
  String _aiQuestion =
      "Welcome to your Shield portal. Would you like to check in?";
  bool _awaitingSecondaryCheck = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 4), // Slower "breath" by default
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void didUpdateWidget(ElderHomeView oldWidget) {
    super.didUpdateWidget(oldWidget);
    _updateAnimationSpeed();
  }

  void _updateAnimationSpeed() {
    final members = ref.read(familyProvider);
    final user = ref.read(userProvider);
    final me = members.firstWhere(
      (m) => m.id == user.id,
      orElse: () => members.first,
    );

    // URGENCY: Speed up if meds are overdue
    if (me.isMedicationOverdue) {
      _controller.duration = const Duration(seconds: 2);
    } else {
      _controller.duration = const Duration(seconds: 4);
    }

    if (_controller.isAnimating) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _simulateVoiceInput(String text) async {
    setState(() => _isProcessingVoice = true);
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      final user = ref.read(userProvider);
      if (!_awaitingSecondaryCheck) {
        ref
            .read(familyProvider.notifier)
            .markMedicationTaken(user.id!, 'Medication', viaVoice: true);
        setState(() {
          // PHASE 1 DIALOGUE
          _aiQuestion =
              "Thank you. Are you feeling any dizziness or pain right now?";
          _awaitingSecondaryCheck = true;
          _isProcessingVoice = false;
        });
      } else {
        SemanticAnalyzerService.processVoiceResponse(ref, user.id!, text);
        setState(() {
          _aiQuestion = "Your feedback is logged. The family has been updated.";
          _awaitingSecondaryCheck = false;
          _isProcessingVoice = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProvider);
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 60),
            Text(
              "${user.firstName ?? 'Your'}'s Portal",
              style: GoogleFonts.oswald(
                color: Colors.white,
                fontSize: 24,
                letterSpacing: 2,
              ),
            ),
            const Spacer(),

            // CENTRAL TEAL PULSING CIRCLE
            GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact(); // LIGHT IMPACT for standard menu
                _showVoiceSimulationMenu(context);
              },
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  // BREATHING ANIMATION: Subtle scale and opacity pulse
                  final scale = 1.0 + (_controller.value * 0.05);
                  return Transform.scale(
                    scale: scale,
                    child: Container(
                      width: 220,
                      height: 220,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0D9488).withValues(
                              alpha: 0.1 + (_controller.value * 0.2),
                            ),
                            blurRadius: 40 + (20 * _controller.value),
                            spreadRadius: 10 + (10 * _controller.value),
                          ),
                        ],
                        border: Border.all(
                          color: const Color(0xFF0D9488),
                          width: 4,
                        ),
                      ),
                      child: Icon(
                        _isProcessingVoice
                            ? Icons.graphic_eq_rounded
                            : Icons.face_retouching_natural_rounded,
                        color: const Color(0xFF0D9488),
                        size: 100,
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 60),

            _aiRibbon(),

            const SizedBox(height: 32),
            // PHASE 6: VISITOR LOG BUTTON
            TextButton.icon(
              onPressed: () => context.push('/visitor-log'),
              icon: const Icon(Icons.people_alt_rounded, color: Colors.white70),
              label: const Text(
                "Log Visitor / Guest",
                style: TextStyle(
                  color: Colors.white70,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            const Spacer(),

            // EMERGENCY BUTTON
            _emergencyButton(),
          ],
        ),
      ),
    );
  }

  Widget _aiRibbon() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 32),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Text(
        _isProcessingVoice ? "Listening..." : _aiQuestion,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showVoiceSimulationMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Simulate Voice Response",
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            if (!_awaitingSecondaryCheck) ...[
              _simButton("Yes, I took them.", context),
            ] else ...[
              _simButton("I feel great.", context),
              _simButton("Feeling dizzy now.", context),
              _simButton("A bit shaky today.", context),
            ],
          ],
        ),
      ),
    );
  }

  Widget _simButton(String text, BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0D9488).withValues(alpha: 0.1),
          minimumSize: const Size(double.infinity, 56),
          side: const BorderSide(color: Color(0xFF0D9488)),
        ),
        onPressed: () {
          // PHASE 4: SUCCESS VIBRATION
          HapticFeedback.lightImpact();
          Navigator.pop(context);
          _simulateVoiceInput(text);
        },
        child: Text(text, style: const TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _emergencyButton() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFFF4444),
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 80),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
        ),
        onPressed: () {
          HapticFeedback.heavyImpact(); // HEAVY IMPACT for Emergency
          context.push('/panic');
        },
        child: const Text(
          "EMERGENCY HELP",
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}

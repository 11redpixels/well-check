import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:well_check/features/medical_vault/medical_ledger_view.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PanicView extends ConsumerStatefulWidget {
  const PanicView({super.key});

  @override
  ConsumerState<PanicView> createState() => _PanicViewState();
}

class _PanicViewState extends ConsumerState<PanicView>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isEmergencyActive = false;
  double _connectionProgress = 0.0;
  bool _show911Option = false;
  int _dispatchCountdown = 10;
  Timer? _dispatchTimer;
  Timer? _longDurationTimer;
  Timer? _hapticTimer;

  // PHASE 4: SILENT MODE STATE
  bool _isSilentMode = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _dispatchTimer?.cancel();
    _longDurationTimer?.cancel();
    _hapticTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _triggerEmergency() {
    setState(() => _isEmergencyActive = true);

    // PHASE 4: SILENT MODE BYPASSES HAPTIC HEARTBEAT
    if (!_isSilentMode) {
      _hapticTimer = Timer.periodic(const Duration(milliseconds: 800), (timer) {
        if (_isEmergencyActive) {
          HapticFeedback.mediumImpact();
        } else {
          timer.cancel();
        }
      });
    }

    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() => _connectionProgress = 1.0);
        // PHASE 3: AUTOMATICALLY TRANSITION TO VOICE BRIDGE
        context.push('/voice-bridge');
        _start911Countdown();
      }
    });
  }

  void _start911Countdown() {
    _longDurationTimer = Timer(const Duration(seconds: 5), () {
      if (mounted) {
        setState(() {
          _show911Option = true;
          _dispatchCountdown = 10; // Explicitly set to 10
        });
        _dispatchTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
          if (_dispatchCountdown > 0) {
            setState(() => _dispatchCountdown--);
            if (_dispatchCountdown == 0) {
              _trigger911Dispatch();
            }
          } else {
            timer.cancel();
          }
        });
      }
    });
  }

  void _trigger911Dispatch() {
    // In a real app, this would use a platform channel to trigger an emergency call
    HapticFeedback.heavyImpact(); // HEAVY IMPACT for 911
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("RED-LINE: DISPATCHING EMERGENCY SERVICES"),
        backgroundColor: Colors.black,
      ),
    );
  }

  void _showParamedicHandOff() {
    HapticFeedback.mediumImpact();
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ParamedicHandOffView()),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isEmergencyActive) return _buildEmergencyScreen();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Hold to Trigger Panic",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 64),
                GestureDetector(
                  onLongPressStart: (_) => HapticFeedback.heavyImpact(),
                  onLongPressEnd: (_) => _triggerEmergency(),
                  child: ScaleTransition(
                    scale: Tween<double>(begin: 1.0, end: 1.1).animate(
                      CurvedAnimation(
                        parent: _controller,
                        curve: Curves.easeInOut,
                      ),
                    ),
                    child: Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF4444),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(
                              0xFFFF4444,
                            ).withValues(alpha: 0.4),
                            blurRadius: 40,
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.warning_rounded,
                        color: Colors.white,
                        size: 100,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 64),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // PHASE 4: SILENT MODE TOGGLE
          Positioned(
            top: 80,
            right: 24,
            child: Row(
              children: [
                const Text(
                  "Silent SOS",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF64748B),
                  ),
                ),
                const SizedBox(width: 8),
                Switch(
                  value: _isSilentMode,
                  activeThumbColor: const Color(0xFFFF4444),
                  onChanged: (val) => setState(() => _isSilentMode = val),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmergencyScreen() {
    return Scaffold(
      backgroundColor: _isSilentMode
          ? const Color(0xFF0F172A)
          : const Color(0xFFFF4444), // DARK IF SILENT
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (!_show911Option) ...[
                  Icon(Icons.emergency_rounded, color: Colors.white, size: 120),
                  const SizedBox(height: 32),
                  Text(
                    _isSilentMode ? "SILENT ALERT ACTIVE" : "EMERGENCY ACTIVE",
                    style: GoogleFonts.oswald(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ] else ...[
                  Text(
                    "911 RED-LINE",
                    style: GoogleFonts.oswald(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    "Contacting Emergency Services in $_dispatchCountdown...",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
                const SizedBox(height: 64),

                if (_show911Option) ...[
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(300, 90),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(45),
                      ),
                      elevation: 30,
                    ),
                    onPressed: _trigger911Dispatch,
                    icon: const Icon(Icons.phone_enabled_rounded, size: 40),
                    label: const Text(
                      "DIRECT 911",
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 28,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white, width: 2),
                      minimumSize: const Size(300, 70),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(35),
                      ),
                    ),
                    onPressed: _showParamedicHandOff,
                    icon: const Icon(Icons.medical_services_rounded, size: 28),
                    label: const Text(
                      "HAND TO PARAMEDIC",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFFFF4444),
                    minimumSize: const Size(300, 90),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(45),
                    ),
                    elevation: 20,
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            const MedicalLedgerView(isReadOnly: true),
                      ),
                    );
                  },
                  icon: const Icon(Icons.medical_information_rounded, size: 40),
                  label: const Text(
                    "MEDICAL ID",
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 28,
                      letterSpacing: 2,
                    ),
                  ),
                ),

                const SizedBox(height: 64),
                _voiceBridge(),
              ],
            ),
          ),
          Positioned(
            bottom: 64,
            left: 24,
            right: 24,
            child: _buildSlideToCancel(),
          ),
        ],
      ),
    );
  }

  Widget _voiceBridge() {
    final members = ref.watch(familyProvider);
    final monitors = members.where((m) => m.role == UserRole.monitor).toList();

    return Column(
      children: [
        Text(
          _isSilentMode
              ? "Sending Data to Family..."
              : (_connectionProgress < 1.0
                    ? "Connecting Family Audio..."
                    : "Voice Bridge Live"),
          style: const TextStyle(
            color: Colors.white70,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: monitors
              .map(
                (m) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: _memberStatus(m.name.split(' ')[0], true),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _memberStatus(String name, bool isJoined) {
    return Column(
      children: [
        Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.person, color: Color(0xFFFF4444)),
        ),
        const SizedBox(height: 8),
        Text(
          _isSilentMode ? "Notified" : "Joined",
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildSlideToCancel() {
    return Container(
      width: double.infinity,
      height: 80,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(40),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.4),
          width: 2,
        ),
      ),
      child: Stack(
        children: [
          const Center(
            child: Text(
              'SLIDE TO STOP PANIC',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ),
          ),
          Draggable(
            axis: Axis.horizontal,
            feedback: _cancelHandle(),
            childWhenDragging: const SizedBox.shrink(),
            onDragEnd: (details) {
              if (details.offset.dx > 200) {
                setState(() {
                  _isEmergencyActive = false;
                  _show911Option = false;
                  _hapticTimer?.cancel();
                });
              }
            },
            child: _cancelHandle(),
          ),
        ],
      ),
    );
  }

  Widget _cancelHandle() {
    return Container(
      width: 76,
      height: 76,
      margin: const EdgeInsets.all(2),
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
      child: const Icon(
        Icons.close_rounded,
        color: Color(0xFFFF4444),
        size: 32,
      ),
    );
  }
}

class ParamedicHandOffView extends ConsumerWidget {
  const ParamedicHandOffView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final members = ref.watch(familyProvider);
    final protected = members.firstWhere(
      (m) => m.role == UserRole.protected,
      orElse: () => members.first,
    );
    final familyHead = members.firstWhere(
      (m) => m.role == UserRole.familyHead,
      orElse: () => members.first,
    );

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.close, color: Colors.black, size: 32),
        ),
        title: const Text(
          "FIRST RESPONDER HAND-OFF",
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 14,
            letterSpacing: 2,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "PATIENT IDENTITY",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              protected.name,
              style: GoogleFonts.oswald(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const Text(
              "Primary Care Profile Active",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF64748B),
              ),
            ),

            const SizedBox(height: 48),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFEF4444), width: 2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.warning_amber_rounded,
                        color: Color(0xFFEF4444),
                      ),
                      SizedBox(width: 12),
                      Text(
                        "ALLERGIES",
                        style: TextStyle(
                          color: Color(0xFFEF4444),
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    protected.info.contains('Allergic')
                        ? protected.info
                        : "Check medical vault for full allergy history.",
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 48),
            const Text(
              "PRIMARY PHYSICIAN",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Physician contact info in Shield Vault",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 48),
            const Text(
              "EMERGENCY CONTACTS",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 16),
            _contactTile(familyHead.name, "Family Head"),

            const SizedBox(height: 64),
            Center(
              child: Text(
                "Verification ID: WELL-SHIELD-PRODUCTION",
                style: GoogleFonts.robotoMono(
                  fontSize: 12,
                  color: const Color(0xFF94A3B8),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _contactTile(String name, String role) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              Text(role, style: const TextStyle(color: Color(0xFF64748B))),
            ],
          ),
          IconButton.filled(
            onPressed: () {},
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF0D9488),
            ),
            icon: const Icon(Icons.phone),
          ),
        ],
      ),
    );
  }
}

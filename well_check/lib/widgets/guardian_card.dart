import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';

class GuardianCard extends ConsumerStatefulWidget {
  final String id;
  final String name;
  final String role;
  final String hr;
  final String bp;
  final String info;
  final Color auraColor;
  final IconData avatarIcon;
  final Color avatarBg;
  final bool isSpeeding;
  final bool isMedicationOverdue;
  final bool isWaitingForResponse;

  const GuardianCard({
    super.key,
    required this.id,
    required this.name,
    required this.role,
    required this.hr,
    required this.bp,
    required this.info,
    required this.auraColor,
    required this.avatarIcon,
    required this.avatarBg,
    this.isSpeeding = false,
    this.isMedicationOverdue = false,
    this.isWaitingForResponse = false,
  });

  @override
  ConsumerState<GuardianCard> createState() => _GuardianCardState();
}

class _GuardianCardState extends ConsumerState<GuardianCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _auraAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _auraAnimation = Tween<double>(
      begin: 8.0,
      end: 24.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final member = ref
        .watch(familyProvider)
        .firstWhere((m) => m.id == widget.id);
    final isCritical = member.isCriticalFeedback;
    final isDisconnected = member.isHardwareDisconnected;

    return AnimatedBuilder(
      animation: _auraAnimation,
      builder: (context, child) {
        return AnimatedContainer(
          duration: const Duration(milliseconds: 1500),
          decoration: BoxDecoration(
            color: widget.isWaitingForResponse
                ? const Color(0xFFF1F5F9)
                : (isCritical ||
                          widget.isSpeeding ||
                          widget.isMedicationOverdue ||
                          member.hasWarning
                      ? const Color(0xFFFEF3C7).withValues(alpha: 0.3)
                      : Colors.white),
            borderRadius: BorderRadius.circular(24),
            border:
                (isCritical ||
                    widget.isSpeeding ||
                    widget.isMedicationOverdue ||
                    member.hasWarning)
                ? Border.all(
                    color:
                        (isCritical
                                ? const Color(0xFFFF4444)
                                : const Color(0xFFF59E0B))
                            .withValues(alpha: 0.3),
                    width: 1.5,
                  )
                : null,
            boxShadow: [
              BoxShadow(
                color:
                    (isDisconnected
                            ? const Color(0xFF94A3B8)
                            : (isCritical
                                  ? const Color(0xFFFF4444)
                                  : widget.auraColor))
                        .withValues(alpha: 0.15),
                blurRadius: _auraAnimation.value,
                spreadRadius: _auraAnimation.value / 4,
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: child,
        );
      },
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: widget.avatarBg,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Icon(
                        widget.avatarIcon,
                        color: isDisconnected
                            ? const Color(0xFF94A3B8)
                            : (isCritical
                                  ? const Color(0xFFFF4444)
                                  : widget.auraColor),
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.name,
                          style: const TextStyle(
                            fontSize: 19,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.4,
                          ),
                        ),
                        Text(
                          widget.isWaitingForResponse
                              ? "Waiting for response..."
                              : (isDisconnected ? member.status : widget.role),
                          style: TextStyle(
                            fontSize: 14,
                            color: widget.isWaitingForResponse
                                ? const Color(0xFF3B82F6)
                                : (isDisconnected
                                      ? const Color(0xFF94A3B8)
                                      : (isCritical
                                            ? const Color(0xFFFF4444)
                                            : widget.auraColor)),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (member.managedDevices.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Row(
                            children: member.managedDevices.map((d) {
                              IconData icon = Icons.watch_rounded;
                              if (d.deviceType == 'nanit_cam') {
                                icon = Icons.videocam_rounded;
                              }
                              if (d.deviceType == 'bp_cuff') {
                                icon = Icons.monitor_heart_rounded;
                              }

                              return Padding(
                                padding: const EdgeInsets.only(right: 6.0),
                                child: Icon(
                                  icon,
                                  size: 12,
                                  color: const Color(0xFF0D9488),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
                if (isCritical)
                  const Icon(
                    Icons.emergency_rounded,
                    color: Color(0xFFFF4444),
                    size: 30,
                  )
                else if (isDisconnected)
                  const Icon(
                    Icons.signal_cellular_off_rounded,
                    color: Color(0xFF94A3B8),
                    size: 24,
                  )
                else
                  Icon(
                    widget.isSpeeding
                        ? Icons.speed_rounded
                        : Icons.verified_user_rounded,
                    color: widget.auraColor,
                    size: 30,
                  ),
              ],
            ),

            // VITALS / ENVIRONMENT RIBBON
            if (widget.hr.isNotEmpty || widget.bp.isNotEmpty) ...[
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _vitalWidget(
                      member.role == UserRole.minor
                          ? 'HEART RATE'
                          : (widget.hr.contains('Room') ? 'TEMP' : 'HR'),
                      widget.hr,
                      member.role == UserRole.minor
                          ? 'bpm'
                          : (widget.hr.contains('Room') ? '' : 'bpm'),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        '|',
                        style: TextStyle(
                          color: Color(0xFFE2E8F0),
                          fontSize: 18,
                        ),
                      ),
                    ),
                    _vitalWidget(
                      member.role == UserRole.protected
                          ? (widget.bp.contains('Score') ? 'SCORE' : 'BP')
                          : 'HUMIDITY',
                      member.role == UserRole.protected
                          ? widget.bp
                                .replaceAll('Score: ', '')
                                .replaceAll('Room: ', '')
                          : "${member.humidity.toInt()}%",
                      '',
                    ),
                  ],
                ),
              ),
            ],

            if (member.role == UserRole.protected &&
                member.lastVoiceNote != null)
              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: _ContextRibbon(
                  text: member.lastVoiceNote!,
                  isCritical: isCritical,
                ),
              ),

            const SizedBox(height: 18),
            Row(
              children: [
                Icon(
                  widget.isWaitingForResponse
                      ? Icons.hourglass_empty_rounded
                      : (isCritical ||
                                widget.isSpeeding ||
                                widget.isMedicationOverdue ||
                                member.hasWarning
                            ? Icons.warning_rounded
                            : Icons.info_outline_rounded),
                  size: 20,
                  color: widget.isWaitingForResponse
                      ? const Color(0xFF3B82F6)
                      : (isCritical
                            ? const Color(0xFFFF4444)
                            : widget.auraColor),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isCritical
                        ? "CRITICAL FEEDBACK DETECTED"
                        : (isDisconnected
                              ? "Check Hardware Source"
                              : widget.info),
                    style: TextStyle(
                      fontSize: 14,
                      color: widget.isWaitingForResponse
                          ? const Color(0xFF3B82F6)
                          : (isCritical ||
                                    widget.isSpeeding ||
                                    widget.isMedicationOverdue ||
                                    member.hasWarning
                                ? const Color(0xFFEF4444)
                                : const Color(0xFF0F172A)),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _vitalWidget(String label, String value, String unit) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Colors.grey[500],
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 2),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              value,
              style: GoogleFonts.robotoMono(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: const Color(0xFF0F172A),
              ),
            ),
            if (unit.isNotEmpty) ...[
              const SizedBox(width: 4),
              Text(
                unit,
                style: GoogleFonts.robotoMono(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[400],
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _ContextRibbon extends StatefulWidget {
  final String text;
  final bool isCritical;
  const _ContextRibbon({required this.text, required this.isCritical});
  @override
  State<_ContextRibbon> createState() => _ContextRibbonState();
}

class _ContextRibbonState extends State<_ContextRibbon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0.05, end: 0.2).animate(_controller);
    if (widget.isCritical) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(_ContextRibbon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isCritical && !oldWidget.isCritical) {
      _controller.repeat(reverse: true);
    } else if (!widget.isCritical && oldWidget.isCritical) {
      _controller.stop();
      _controller.reset();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseColor = widget.isCritical
        ? const Color(0xFFFF4444)
        : const Color(0xFF0D9488);
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: baseColor.withValues(
              alpha: widget.isCritical ? _animation.value : 0.05,
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: baseColor.withValues(alpha: 0.15)),
          ),
          child: Row(
            children: [
              if (widget.isCritical)
                const Padding(
                  padding: EdgeInsets.only(right: 8.0),
                  child: Icon(
                    Icons.priority_high_rounded,
                    color: Color(0xFFFF4444),
                    size: 16,
                  ),
                ),
              Expanded(
                child: Text(
                  "Note: \"${widget.text}\"",
                  style: TextStyle(
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                    color: baseColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (widget.isCritical)
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF4444),
                    minimumSize: const Size(80, 32),
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    "CALL",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ConnectivityView extends StatelessWidget {
  const ConnectivityView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 80, 24, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Hardware Nexus",
              style: GoogleFonts.oswald(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Text(
              "Link devices and external medical services.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 48),

            _serviceBridge("Apple Health", "Protected Member HR/BP", true),
            _serviceBridge("Smart Nursery API", "Environment Sensor", true),
            _serviceBridge("Phone Telemetry", "Minor Driving Data", true),
            _serviceBridge("Fitbit Cloud", "Exercise Monitoring", false),

            const SizedBox(height: 48),
            _infoCard(
              "Data Integrity",
              "A pulsing green dot indicates a real-time secure handshake with the provider.",
            ),
          ],
        ),
      ),
    );
  }

  Widget _serviceBridge(String title, String subtitle, bool isConnected) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color:
                  (isConnected
                          ? const Color(0xFF0D9488)
                          : const Color(0xFFFF4444))
                      .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              isConnected ? Icons.link_rounded : Icons.link_off_rounded,
              color: isConnected
                  ? const Color(0xFF0D9488)
                  : const Color(0xFFFF4444),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
              ],
            ),
          ),
          if (isConnected)
            _PulsingDot()
          else
            const Icon(Icons.close_rounded, color: Color(0xFFFF4444), size: 16),
        ],
      ),
    );
  }

  Widget _infoCard(String title, String body) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            body,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
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
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: Tween(begin: 0.8, end: 1.2).animate(_controller),
      child: Container(
        width: 8,
        height: 8,
        decoration: const BoxDecoration(
          color: Color(0xFF0D9488),
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

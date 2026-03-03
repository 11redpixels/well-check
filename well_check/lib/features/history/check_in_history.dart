import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CheckInHistoryView extends StatelessWidget {
  const CheckInHistoryView({super.key});

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
              "Check-in Logs",
              style: GoogleFonts.oswald(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 32),
            _logItem(
              "12:05 PM",
              "Medication intake confirmed via voice.",
              Icons.mic_rounded,
              const Color(0xFF0D9488),
            ),
            _logItem(
              "Yesterday",
              "Member reported feeling 'Great' during morning check-in.",
              Icons.sentiment_very_satisfied_rounded,
              const Color(0xFF0D9488),
            ),
          ],
        ),
      ),
    );
  }

  Widget _logItem(String time, String message, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                Text(
                  time,
                  style: TextStyle(color: Colors.grey[500], fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

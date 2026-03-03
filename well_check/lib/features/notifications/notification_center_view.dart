import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NotificationCenterView extends StatelessWidget {
  const NotificationCenterView({super.key});

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
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  "Shield Notifications",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // PHASE 4: GLOBAL NOTIFICATION CENTER FEED
            _notificationItem(
              "Just Now",
              "Member corrected their speed.",
              Icons.check_circle_rounded,
              const Color(0xFF0D9488),
            ),
            _notificationItem(
              "1 hour ago",
              "Environment sensor reached 72°F.",
              Icons.thermostat_rounded,
              const Color(0xFF3B82F6),
            ),
            _notificationItem(
              "2 hours ago",
              "A member left the Safe Zone.",
              Icons.location_on_rounded,
              const Color(0xFFF59E0B),
            ),
            _notificationItem(
              "Today",
              "LOW BATTERY alert acknowledged.",
              Icons.battery_alert_rounded,
              const Color(0xFFF59E0B),
            ),
          ],
        ),
      ),
    );
  }

  Widget _notificationItem(
    String time,
    String message,
    IconData icon,
    Color color,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
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
                    color: Color(0xFF0F172A),
                  ),
                ),
                Text(
                  time,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

class PrivacySettingsView extends StatelessWidget {
  const PrivacySettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "SHIELD PERMISSIONS",
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w900,
            color: Color(0xFF94A3B8),
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 16),
        _permissionTile("Location Sharing", "ACTIVE", const Color(0xFF0D9488)),
        _permissionTile("Driving Telemetry", "ACTIVE", const Color(0xFF0D9488)),
        _permissionTile("Health Vitals", "OFF", const Color(0xFF94A3B8)),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Row(
            children: [
              Icon(
                Icons.lock_outline_rounded,
                color: Color(0xFF64748B),
                size: 20,
              ),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  "Only Brian (Admin) can modify these core family safety protocols.",
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _permissionTile(String label, String status, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          Text(
            status,
            style: TextStyle(
              fontWeight: FontWeight.w900,
              color: color,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

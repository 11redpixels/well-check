import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';

class DrivingView extends ConsumerWidget {
  const DrivingView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final members = ref.watch(familyProvider);
    final target = members.firstWhere(
      (m) => m.role == UserRole.minor,
      orElse: () => members.first,
    );

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
                  "${target.name.split(' ')[0]}'s Driving",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const Text(
              "Proactive telematics and safety monitoring.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 32),

            _speedAlertCard(target.currentSpeed ?? 0),
            const SizedBox(height: 24),
            _hardBrakingCard(0), // Would pull from telematics logs
            const SizedBox(height: 24),

            _mockMap(target),
          ],
        ),
      ),
    );
  }

  Widget _mockMap(FamilyMember member) {
    return Container(
      height: 300,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 2),
      ),
      child: Stack(
        children: [
          Center(
            child: Icon(Icons.map_rounded, size: 100, color: Colors.grey[400]),
          ),
          Positioned(
            top: 100,
            left: 150,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Color(0xFF3B82F6),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.directions_car_filled_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: Text(
                    member.name.split(' ')[0],
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _speedAlertCard(int speed) {
    final isHighSpeed = speed > 75;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isHighSpeed
            ? const Color(0xFFFEF3C7).withValues(alpha: 0.5)
            : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isHighSpeed
              ? const Color(0xFFF59E0B).withValues(alpha: 0.5)
              : Colors.transparent,
          width: 2,
        ),
        boxShadow: isHighSpeed
            ? [
                BoxShadow(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ]
            : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Top Speed',
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              if (isHighSpeed)
                const Text(
                  '⚠️ SPEED LIMIT EXCEEDED',
                  style: TextStyle(
                    color: Color(0xFFEF4444),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              Text(
                '$speed mph',
                style: GoogleFonts.robotoMono(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: isHighSpeed
                      ? const Color(0xFFD97706)
                      : const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          if (isHighSpeed)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'HIGH SPEED',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _hardBrakingCard(int count) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.emergency_rounded,
              color: Color(0xFFF59E0B),
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Hard Braking Events',
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '$count today',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

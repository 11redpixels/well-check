import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:well_check/providers/family_provider.dart';
import 'package:well_check/models/user_role.dart';

class HealthTrendsView extends ConsumerWidget {
  const HealthTrendsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final members = ref.watch(familyProvider);
    final target = members.firstWhere(
      (m) => m.role == UserRole.protected,
      orElse: () => members.first,
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
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
                  "${target.name.split(' ')[0]}'s Vitals",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // AI MOOD SCORE & ACTIVITY
            _sentimentAndActivityRow(),
            const SizedBox(height: 32),

            // HEART RATE TREND
            _sectionHeader("Heart Rate (24h Trend)"),
            _chartContainer(child: LineChart(_heartRateChartData())),
            const SizedBox(height: 32),

            _vitalsSummary(),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0, left: 4),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: Color(0xFF94A3B8),
          fontWeight: FontWeight.w900,
          fontSize: 11,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _chartContainer({required Widget child}) {
    return Container(
      height: 220,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: child,
    );
  }

  Widget _sentimentAndActivityRow() {
    return Row(
      children: [
        Expanded(
          child: _metricSquare(
            "AI Mood Score",
            "Analyzing",
            Icons.face_retouching_natural_rounded,
            const Color(0xFF0D9488),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _metricSquare(
            "Last Movement",
            "Just Now",
            Icons.directions_walk_rounded,
            const Color(0xFF3B82F6),
          ),
        ),
      ],
    );
  }

  Widget _metricSquare(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFF0F172A),
              fontWeight: FontWeight.w900,
              fontSize: 18,
            ),
          ),
        ],
      ),
    );
  }

  LineChartData _heartRateChartData() {
    return LineChartData(
      gridData: const FlGridData(show: false),
      titlesData: const FlTitlesData(show: false),
      borderData: FlBorderData(show: false),
      lineBarsData: [
        LineChartBarData(
          spots: [
            const FlSpot(0, 72),
            const FlSpot(4, 68),
            const FlSpot(8, 75),
            const FlSpot(12, 85),
            const FlSpot(16, 70),
            const FlSpot(24, 72),
          ],
          isCurved: true,
          color: const Color(0xFF0D9488),
          barWidth: 4,
          dotData: const FlDotData(show: false),
          belowBarData: BarAreaData(
            show: true,
            color: const Color(0xFF0D9488).withValues(alpha: 0.1),
          ),
        ),
      ],
    );
  }

  Widget _vitalsSummary() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: const Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Status', style: TextStyle(color: Color(0xFF64748B))),
              Text(
                'Live Feed Active',
                style: TextStyle(
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

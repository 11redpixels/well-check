import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:well_check/models/user_role.dart';
import '../../providers/family_provider.dart';

class GeofenceView extends ConsumerWidget {
  const GeofenceView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final members = ref.watch(familyProvider);
    final target = members.firstWhere(
      (m) => !m.isOnCampus || m.role == UserRole.minor,
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
                  "Safe Zone Monitor",
                  style: GoogleFonts.oswald(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            _geofenceMap(target),

            const SizedBox(height: 32),

            _statusCard(target.isOnCampus, target.name),
          ],
        ),
      ),
    );
  }

  Widget _geofenceMap(FamilyMember member) {
    return Container(
      height: 400,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 2),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Safe Zone Radius
          Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              color: const Color(0xFF0D9488).withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFF0D9488).withValues(alpha: 0.3),
                width: 2,
              ),
            ),
          ),

          // PHASE 2: BREADCRUMB TRAIL
          CustomPaint(
            size: const Size(400, 400),
            painter: BreadcrumbPainter(member.breadcrumbs),
          ),

          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.home_rounded, color: Color(0xFF64748B), size: 32),
              Text(
                'Safety Hub',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF64748B),
                  fontSize: 12,
                ),
              ),
            ],
          ),

          AnimatedAlign(
            duration: const Duration(seconds: 2),
            curve: Curves.easeInOut,
            alignment: member.isOnCampus
                ? Alignment.center
                : const Alignment(0.8, -0.6),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: member.isOnCampus
                        ? const Color(0xFF0D9488)
                        : const Color(0xFFF59E0B),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color:
                            (member.isOnCampus
                                    ? const Color(0xFF0D9488)
                                    : const Color(0xFFF59E0B))
                                .withValues(alpha: 0.4),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.person_pin_circle_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    member.name,
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

  Widget _statusCard(bool isOnCampus, String name) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Icon(
            Icons.location_on_rounded,
            color: isOnCampus
                ? const Color(0xFF0D9488)
                : const Color(0xFFF59E0B),
            size: 32,
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Status', style: TextStyle(color: Colors.grey[600])),
              Text(
                isOnCampus
                    ? '$name is in Safe Zone'
                    : '$name is Outside Safe Zone',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: isOnCampus
                      ? const Color(0xFF0D9488)
                      : const Color(0xFFD97706),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class BreadcrumbPainter extends CustomPainter {
  final List<Offset> points;
  BreadcrumbPainter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    if (points.length < 2) return;

    final paint = Paint()
      ..color = const Color(0xFF3B82F6).withValues(alpha: 0.3)
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    // Translate offsets to screen coordinates relative to center
    final center = Offset(size.width / 2, size.height / 2);

    path.moveTo(center.dx + points[0].dx * 100, center.dy + points[0].dy * 100);
    for (var i = 1; i < points.length; i++) {
      path.lineTo(
        center.dx + points[i].dx * 100,
        center.dy + points[i].dy * 100,
      );
    }

    canvas.drawPath(path, paint);

    // Draw dots for each breadcrumb
    for (final p in points) {
      canvas.drawCircle(
        Offset(center.dx + p.dx * 100, center.dy + p.dy * 100),
        4,
        paint..style = PaintingStyle.fill,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SafeZonesView extends StatefulWidget {
  const SafeZonesView({super.key});

  @override
  State<SafeZonesView> createState() => _SafeZonesViewState();
}

class _SafeZonesViewState extends State<SafeZonesView> {
  double _radius = 250.0;
  Offset _pinPosition = const Offset(0, 0);

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
              "Sentinel Maps",
              style: GoogleFonts.oswald(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Text(
              "Interactive geofence drawing and live trace.",
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 32),

            // PHASE 4: INTERACTIVE MAP (SIMULATED)
            GestureDetector(
              onPanUpdate: (details) {
                setState(() {
                  _pinPosition += Offset(
                    details.delta.dx / 200,
                    details.delta.dy / 200,
                  );
                });
              },
              child: Container(
                height: 400,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(32),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(
                      Icons.map_rounded,
                      size: 100,
                      color: Colors.white,
                    ),

                    // INTERACTIVE RADIUS
                    Container(
                      width: _radius,
                      height: _radius,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF0D9488).withValues(alpha: 0.1),
                        border: Border.all(
                          color: const Color(0xFF0D9488),
                          width: 2,
                        ),
                      ),
                    ),

                    // DRAGGABLE PIN
                    Transform.translate(
                      offset: Offset(
                        _pinPosition.dx * 100,
                        _pinPosition.dy * 100,
                      ),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.location_on_rounded,
                            color: Color(0xFF0D9488),
                            size: 40,
                          ),
                          Text(
                            'Family Home',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),
            _radiusSlider(),
            const SizedBox(height: 24),
            _zoneCard(
              "Active Safe Zone",
              "500m Radius • Active",
              const Color(0xFF0D9488),
            ),
          ],
        ),
      ),
    );
  }

  Widget _radiusSlider() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Safety Radius",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                "${(_radius * 2).toInt()}m",
                style: const TextStyle(
                  color: Color(0xFF0D9488),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          Slider(
            value: _radius,
            min: 100,
            max: 500,
            activeColor: const Color(0xFF0D9488),
            onChanged: (val) => setState(() => _radius = val),
          ),
        ],
      ),
    );
  }

  Widget _zoneCard(String name, String detail, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Icon(Icons.shield_rounded, color: color),
          const SizedBox(width: 16),
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
              Text(
                detail,
                style: TextStyle(color: Colors.grey[600], fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

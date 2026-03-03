import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color ghostWhite = Color(0xFFF8FAFC);
  static const Color industrialBlue = Color(0xFF3B82F6);
  static const Color slateDark = Color(0xFF0F172A);
  static const Color productionTeal = Color(0xFF0D9488); // THE PRODUCTION TEAL
  static const Color emergencyRed = Color(0xFFFF4444);

  // Splash Gradient: Teal to Midnight
  static const LinearGradient splashGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF14B8A6), Color(0xFF0F172A)],
  );

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: ghostWhite,
      primaryColor: productionTeal,
      colorScheme: ColorScheme.fromSeed(
        seedColor: productionTeal,
        surface: Colors.white,
      ),
      textTheme: GoogleFonts.openSansTextTheme().copyWith(
        displayLarge: GoogleFonts.oswald(
          fontWeight: FontWeight.bold,
          color: slateDark,
          fontSize: 32,
        ),
        titleLarge: GoogleFonts.openSans(
          fontWeight: FontWeight.bold,
          color: slateDark,
          fontSize: 20,
        ),
        bodyMedium: GoogleFonts.openSans(
          color: slateDark.withValues(alpha: 0.8),
          fontSize: 16,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        margin: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24.0),
        ),
        color: Colors.white,
      ),
    );
  }
}

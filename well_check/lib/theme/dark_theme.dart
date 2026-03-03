import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppDarkTheme {
  static const Color midnightBlue = Color(0xFF0F172A);
  static const Color electricCyan = Color(0xFF22D3EE);
  static const Color slateGrey = Color(0xFF334155);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: midnightBlue,
      primaryColor: electricCyan,
      colorScheme: ColorScheme.fromSeed(
        brightness: Brightness.dark,
        seedColor: electricCyan,
        surface: slateGrey,
      ),
      // THE FIX: Using CardThemeData
      cardTheme: CardThemeData(
        elevation: 0,
        margin: const EdgeInsets.symmetric(vertical: 12),
        color: slateGrey,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24.0),
        ),
      ),
      textTheme: GoogleFonts.openSansTextTheme(
        ThemeData.dark().textTheme.copyWith(
          displayLarge: GoogleFonts.oswald(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 32,
          ),
          titleLarge: GoogleFonts.openSans(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 20,
          ),
          bodyMedium: GoogleFonts.openSans(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}

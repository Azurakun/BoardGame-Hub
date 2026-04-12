import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppThemes {
  static final _lightTextTheme = GoogleFonts.outfitTextTheme(ThemeData.light().textTheme);
  static final _darkTextTheme = GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme);

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: Color(0xFF4F46E5), // Indigo
      secondary: Color(0xFF0D9488), // Teal
      tertiary: Color(0xFFE11D48), // Rose
      error: Color(0xFFDC2626),
      surface: Color(0xFFF8FAFC),
      background: Color(0xFFF1F5F9), // Slate 100
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Color(0xFF0F172A),
    ),
    textTheme: _lightTextTheme,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      foregroundColor: Color(0xFF0F172A),
    ),
    cardTheme: CardThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 4,
      color: Colors.white,
      shadowColor: const Color(0xFF4F46E5).withOpacity(0.15),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: Color(0xFF818CF8), // Light Indigo
      secondary: Color(0xFF2DD4BF), // Light Teal
      tertiary: Color(0xFFFB7185), // Light Rose
      error: Color(0xFFF87171),
      surface: Color(0xFF1E293B), // Slate 800
      background: Color(0xFF0F172A), // Slate 900
      onPrimary: Color(0xFF0F172A),
      onSecondary: Color(0xFF0F172A),
      onSurface: Color(0xFFF8FAFC),
    ),
    scaffoldBackgroundColor: const Color(0xFF0F172A),
    textTheme: _darkTextTheme.apply(
      bodyColor: const Color(0xFFF8FAFC),
      displayColor: const Color(0xFFF8FAFC),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      foregroundColor: Color(0xFFF8FAFC),
    ),
    cardTheme: CardThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 8,
      color: const Color(0xFF1E293B),
      shadowColor: const Color(0xFF6366F1).withOpacity(0.25),
    ),
  );
}

import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFF0D0D0D);
  static const Color card = Color(0xFF1A1A1A);
  static const Color gold = Color(0xFFC9A84C);
  static const Color white = Colors.white;
  static const Color muted = Color(0xFF888888);
  static const Color border = Color(0xFF2A2A2A);
  static const Color error = Color(0xFFFF4444);
  static const Color success = Color(0xFF4CAF50);
}

class AppTextStyles {
  static const TextStyle logo = TextStyle(
    color: AppColors.gold,
    fontSize: 22,
    fontWeight: FontWeight.w900,
    letterSpacing: 4,
  );

  static const TextStyle logoSub = TextStyle(
    color: AppColors.gold,
    fontSize: 10,
    fontWeight: FontWeight.w400,
    letterSpacing: 6,
  );

  static const TextStyle heading1 = TextStyle(
    color: AppColors.white,
    fontSize: 28,
    fontWeight: FontWeight.w900,
  );

  static const TextStyle heading2 = TextStyle(
    color: AppColors.white,
    fontSize: 22,
    fontWeight: FontWeight.w800,
  );

  static const TextStyle heading3 = TextStyle(
    color: AppColors.white,
    fontSize: 18,
    fontWeight: FontWeight.w700,
  );

  static const TextStyle body = TextStyle(
    color: AppColors.white,
    fontSize: 14,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle muted = TextStyle(
    color: AppColors.muted,
    fontSize: 13,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle gold = TextStyle(
    color: AppColors.gold,
    fontSize: 14,
    fontWeight: FontWeight.w600,
  );

  static const TextStyle price = TextStyle(
    color: AppColors.white,
    fontSize: 24,
    fontWeight: FontWeight.w900,
  );

  static const TextStyle button = TextStyle(
    color: AppColors.white,
    fontSize: 14,
    fontWeight: FontWeight.w800,
    letterSpacing: 1.5,
  );
}

class AppTheme {
  static ThemeData get darkTheme => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.gold,
          surface: AppColors.card,
          onPrimary: AppColors.white,
          onSurface: AppColors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          elevation: 0,
          titleTextStyle: TextStyle(
            color: AppColors.white,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
          iconTheme: IconThemeData(color: AppColors.white),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.card,
          selectedItemColor: AppColors.gold,
          unselectedItemColor: AppColors.muted,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),
        cardColor: AppColors.card,
        dividerColor: AppColors.border,
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: AppColors.white),
          bodyMedium: TextStyle(color: AppColors.white),
          titleLarge: TextStyle(color: AppColors.white, fontWeight: FontWeight.w700),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.card,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.gold),
          ),
          hintStyle: const TextStyle(color: AppColors.muted),
          labelStyle: const TextStyle(color: AppColors.muted),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.gold,
            foregroundColor: AppColors.white,
            textStyle: AppTextStyles.button,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            minimumSize: const Size(double.infinity, 52),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.white,
            side: const BorderSide(color: AppColors.gold, width: 1.5),
            textStyle: AppTextStyles.button,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            minimumSize: const Size(double.infinity, 52),
          ),
        ),
      );
}

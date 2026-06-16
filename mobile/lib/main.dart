import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'services/auth_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final authService = AuthService();
  await authService.init();
  runApp(EyeGlazeApp(authService: authService));
}

class EyeGlazeApp extends StatelessWidget {
  final AuthService authService;
  const EyeGlazeApp({super.key, required this.authService});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authService),
      ],
      child: MaterialApp(
        title: 'EyeGlaze',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: authService.isLoggedIn ? const HomeScreen() : const LoginScreen(),
        routes: {
          '/login': (_) => const LoginScreen(),
          '/home': (_) => const HomeScreen(),
        },
      ),
    );
  }
}

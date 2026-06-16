import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../widgets/trust_strip.dart';
import '../../widgets/eyeglaze_logo.dart';
import 'phone_login_screen.dart';
import 'email_login_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: AppColors.white),
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.white),
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                ],
              ),
            ),
            // Logo
            const EyeGlazeLogo(),
            const SizedBox(height: 24),
            // Welcome text
            const Text('Welcome to EyeGlaze', style: AppTextStyles.heading2),
            const SizedBox(height: 6),
            const Text('Login / Sign up to continue', style: AppTextStyles.muted),
            const SizedBox(height: 28),
            // Auth options
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _AuthOptionCard(
                    icon: Icons.phone_android,
                    title: 'Continue with Mobile Number',
                    subtitle: 'Login or sign up with OTP',
                    onTap: () => Navigator.push(
                        context, MaterialPageRoute(builder: (_) => const PhoneLoginScreen())),
                  ),
                  const SizedBox(height: 12),
                  _AuthOptionCard(
                    icon: Icons.email_outlined,
                    title: 'Continue with Email',
                    subtitle: 'Login or sign up with OTP',
                    onTap: () => Navigator.push(
                        context, MaterialPageRoute(builder: (_) => const EmailLoginScreen())),
                  ),
                ],
              ),
            ),
            // Divider
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16, horizontal: 20),
              child: Row(
                children: [
                  Expanded(child: Divider(color: AppColors.border)),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('or', style: AppTextStyles.muted),
                  ),
                  Expanded(child: Divider(color: AppColors.border)),
                ],
              ),
            ),
            // Trust badges
            const TrustStrip(),
            const Spacer(),
            // Footer
            Padding(
              padding: const EdgeInsets.all(16),
              child: RichText(
                textAlign: TextAlign.center,
                text: const TextSpan(
                  style: TextStyle(color: AppColors.muted, fontSize: 12),
                  children: [
                    TextSpan(text: 'By continuing, you agree to our '),
                    TextSpan(
                      text: 'Terms of Use',
                      style: TextStyle(color: AppColors.gold, decoration: TextDecoration.underline),
                    ),
                    TextSpan(text: ' and '),
                    TextSpan(
                      text: 'Privacy Policy',
                      style: TextStyle(color: AppColors.gold, decoration: TextDecoration.underline),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthOptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _AuthOptionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.card,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.gold, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: AppTextStyles.muted),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.muted),
          ],
        ),
      ),
    );
  }
}

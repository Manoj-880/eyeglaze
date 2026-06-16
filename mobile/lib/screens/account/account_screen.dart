import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final user = authService.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Account', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold)),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User avatar & info
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 60, height: 60,
                    decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle),
                    child: Center(
                      child: Text(
                        user?.name?.isNotEmpty == true ? user!.name![0].toUpperCase() : 'U',
                        style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? 'EyeGlaze User', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w700, fontSize: 16)),
                        const SizedBox(height: 4),
                        if (user?.phone != null) Text('+91 ${user!.phone}', style: AppTextStyles.muted),
                        if (user?.email != null) Text(user!.email!, style: AppTextStyles.muted),
                      ],
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.edit_outlined, color: AppColors.gold), onPressed: () {}),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Menu items
            _MenuItem(icon: Icons.shopping_bag_outlined, label: 'My Orders', onTap: () {}),
            _MenuItem(icon: Icons.favorite_outline, label: 'Wishlist', onTap: () {}),
            _MenuItem(icon: Icons.location_on_outlined, label: 'Saved Addresses', onTap: () {}),
            _MenuItem(icon: Icons.description_outlined, label: 'My Prescriptions', onTap: () {}),
            _MenuItem(icon: Icons.workspace_premium_outlined, label: 'EyeGlaze Membership', onTap: () {}),
            _MenuItem(icon: Icons.help_outline, label: 'Help & Support', onTap: () {}),
            _MenuItem(icon: Icons.policy_outlined, label: 'Terms & Privacy', onTap: () {}),
            const SizedBox(height: 16),
            // Logout
            GestureDetector(
              onTap: () async {
                await authService.clearToken();
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (r) => false,
                  );
                }
              },
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.logout, color: AppColors.error, size: 22),
                    SizedBox(width: 12),
                    Text('Logout', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600, fontSize: 15)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('EyeGlaze v1.0.0', style: TextStyle(color: AppColors.muted, fontSize: 12)),
            const SizedBox(height: 8),
            const Text('Premium Eyewear for Every Version of You.', style: TextStyle(color: AppColors.muted, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MenuItem({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.gold, size: 22),
          const SizedBox(width: 14),
          Expanded(child: Text(label, style: const TextStyle(color: AppColors.white, fontSize: 14))),
          const Icon(Icons.chevron_right, color: AppColors.muted, size: 20),
        ],
      ),
    ),
  );
}

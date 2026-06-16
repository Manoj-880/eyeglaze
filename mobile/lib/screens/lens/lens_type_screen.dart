import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../widgets/lens_step_bar.dart';
import '../../widgets/lens_wizard_state.dart';
import '../../widgets/gold_button.dart';
import 'lens_power_screen.dart';

class LensTypeScreen extends StatefulWidget {
  const LensTypeScreen({super.key});

  @override
  State<LensTypeScreen> createState() => _LensTypeScreenState();
}

class _LensTypeScreenState extends State<LensTypeScreen> {
  String? _selected;

  final _lensTypes = [
    {
      'type': 'single_vision',
      'name': 'Single Vision',
      'desc': 'Best for distance or near vision with a single power',
      'price': 'From ₹699',
      'icon': Icons.visibility,
    },
    {
      'type': 'progressive',
      'name': 'Progressive',
      'desc': 'Clear vision at all distances (near, intermediate & far)',
      'price': 'From ₹2,499',
      'icon': Icons.blur_linear,
    },
    {
      'type': 'zero_power',
      'name': 'Zero Power (Plano)',
      'desc': 'For style only without any power',
      'price': 'From ₹699',
      'icon': Icons.remove_red_eye_outlined,
    },
    {
      'type': 'bluecut',
      'name': 'Blue Cut',
      'desc': 'Protects eyes from harmful blue light',
      'price': 'From ₹899',
      'icon': Icons.phone_android,
    },
    {
      'type': 'photochromic',
      'name': 'Photochromic',
      'desc': 'Automatically adjusts to light. Darkens in sun, clear indoors',
      'price': 'From ₹1,499',
      'icon': Icons.wb_sunny_outlined,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final wizard = context.watch<LensWizardState>();
    final product = wizard.product;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Buy With Lens', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: AppColors.white), onPressed: () => Navigator.pop(context)),
      ),
      body: Column(
        children: [
          const LensStepBar(currentStep: 1),
          // Mini product card
          if (product != null)
            _MiniProductCard(
              sku: product.sku,
              name: product.name,
              color: wizard.selectedColor ?? '',
              size: wizard.sizeString,
            ),
          // Section header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('CHOOSE LENS TYPE', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 1)),
                const SizedBox(height: 2),
                const Text('All lenses come with 100% UV Protection', style: TextStyle(color: AppColors.muted, fontSize: 12)),
              ],
            ),
          ),
          // Lens type list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _lensTypes.length,
              itemBuilder: (_, i) {
                final lt = _lensTypes[i];
                final isSelected = _selected == lt['type'];
                return GestureDetector(
                  onTap: () => setState(() => _selected = lt['type'] as String),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      border: Border.all(color: isSelected ? AppColors.gold : AppColors.border, width: isSelected ? 2 : 1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.gold.withValues(alpha: 0.15) : AppColors.background,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(lt['icon'] as IconData, color: isSelected ? AppColors.gold : AppColors.muted, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(lt['name'] as String, style: TextStyle(color: isSelected ? AppColors.gold : AppColors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                              const SizedBox(height: 2),
                              Text(lt['desc'] as String, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                              const SizedBox(height: 4),
                              Text(lt['price'] as String, style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                        ),
                        if (isSelected)
                          const Icon(Icons.check_circle, color: AppColors.gold),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          // Trust + CTA
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: const [
                _FooterBadge(icon: Icons.wb_sunny_outlined, label: '100% UV'),
                _FooterBadge(icon: Icons.verified_outlined, label: '1 Yr Warranty'),
                _FooterBadge(icon: Icons.shield_outlined, label: 'Scratch\nResistant'),
                _FooterBadge(icon: Icons.replay, label: 'Easy Return'),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: GoldButton(
              label: 'CONTINUE TO POWER →',
              onPressed: _selected == null ? null : () {
                context.read<LensWizardState>().setLensType(_selected!);
                Navigator.push(context, MaterialPageRoute(
                  builder: (_) => ChangeNotifierProvider.value(
                    value: context.read<LensWizardState>(),
                    child: const LensPowerScreen(),
                  ),
                ));
              },
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: Text('All lenses are from Lenskart — Trusted quality, perfect clarity', style: TextStyle(color: AppColors.muted, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}

class _MiniProductCard extends StatelessWidget {
  final String sku;
  final String name;
  final String color;
  final String size;

  const _MiniProductCard({required this.sku, required this.name, required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 54, height: 54,
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.visibility_outlined, color: AppColors.muted, size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$sku | $name', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                Text('$color • Size: $size', style: AppTextStyles.muted),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(border: Border.all(color: AppColors.gold), borderRadius: BorderRadius.circular(8)),
              child: const Text('Change Frame', style: TextStyle(color: AppColors.gold, fontSize: 11)),
            ),
          ),
        ],
      ),
    );
  }
}

class _FooterBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  const _FooterBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Icon(icon, color: AppColors.gold, size: 18),
      const SizedBox(height: 3),
      Text(label, style: const TextStyle(color: AppColors.muted, fontSize: 9), textAlign: TextAlign.center),
    ],
  );
}

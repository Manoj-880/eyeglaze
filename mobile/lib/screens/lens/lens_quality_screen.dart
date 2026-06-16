import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../widgets/lens_step_bar.dart';
import '../../widgets/lens_wizard_state.dart';
import '../../widgets/gold_button.dart';
import 'lens_checkout_screen.dart';

class LensQualityScreen extends StatefulWidget {
  const LensQualityScreen({super.key});

  @override
  State<LensQualityScreen> createState() => _LensQualityScreenState();
}

class _LensQualityScreenState extends State<LensQualityScreen> {
  String? _selected = 'hmc_bluecut';
  double _selectedPrice = 999;

  final _options = [
    {
      'id': 'hmc_bluecut',
      'name': 'HMC + Blue Cut',
      'desc': 'Clear & comfortable vision with essential protection',
      'features': ['Anti-Reflective (HMC Coating)', 'Blue Light Protection', 'Water & Dust Repellant'],
      'price': 999.0,
      'recommended': true,
    },
    {
      'id': 'hmc',
      'name': 'HMC',
      'desc': 'Anti-reflective coating for clear & comfortable vision',
      'features': ['Anti-Reflective (HMC Coating)', 'Scratch Resistant'],
      'price': 699.0,
      'recommended': false,
    },
    {
      'id': 'bluecut_quality',
      'name': 'Blue Cut',
      'desc': 'Filters harmful blue light from digital screens',
      'features': ['Blue Light Protection'],
      'price': 899.0,
      'recommended': false,
    },
    {
      'id': 'hc',
      'name': 'HC (Hard Coated)',
      'desc': 'Scratch resistant coating for durable lenses',
      'features': ['Scratch Resistant'],
      'price': 799.0,
      'recommended': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Select Lens Quality', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: AppColors.white), onPressed: () => Navigator.pop(context)),
      ),
      body: Column(
        children: [
          const LensStepBar(currentStep: 3),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Select Lens Quality', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 15)),
                const Text('Choose the quality and features for your lenses', style: TextStyle(color: AppColors.muted, fontSize: 12)),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _options.length,
              itemBuilder: (_, i) {
                final opt = _options[i];
                final isSelected = _selected == opt['id'];
                return GestureDetector(
                  onTap: () => setState(() {
                    _selected = opt['id'] as String;
                    _selectedPrice = opt['price'] as double;
                  }),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      border: Border.all(color: isSelected ? AppColors.gold : AppColors.border, width: isSelected ? 2 : 1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.gold : AppColors.background,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.lens_outlined, color: isSelected ? Colors.white : AppColors.muted, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(opt['name'] as String, style: TextStyle(color: isSelected ? AppColors.gold : AppColors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                                  if (opt['recommended'] as bool) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(4)),
                                      child: const Text('Recommended', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(opt['desc'] as String, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: (opt['features'] as List).map((f) => Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.background,
                                    border: Border.all(color: AppColors.border),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(f as String, style: const TextStyle(color: AppColors.muted, fontSize: 10)),
                                )).toList(),
                              ),
                              const SizedBox(height: 6),
                              Text('₹${(opt['price'] as double).toInt()}/pair', style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 14)),
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
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                Icon(Icons.wb_sunny_outlined, color: AppColors.gold, size: 14),
                SizedBox(width: 6),
                Text('All lenses include 100% UV Protection', style: TextStyle(color: AppColors.muted, fontSize: 12)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: GoldButton(
              label: 'CONTINUE TO CHECKOUT →',
              onPressed: _selected == null ? null : () {
                context.read<LensWizardState>().setLensQuality(_selected!, _selectedPrice);
                Navigator.push(context, MaterialPageRoute(
                  builder: (_) => ChangeNotifierProvider.value(
                    value: context.read<LensWizardState>(),
                    child: const LensCheckoutScreen(),
                  ),
                ));
              },
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

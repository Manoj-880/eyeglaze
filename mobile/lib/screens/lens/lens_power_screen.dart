import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/cart_item.dart';
import '../../widgets/lens_step_bar.dart';
import '../../widgets/lens_wizard_state.dart';
import '../../widgets/gold_button.dart';
import 'lens_quality_screen.dart';

class LensPowerScreen extends StatefulWidget {
  const LensPowerScreen({super.key});

  @override
  State<LensPowerScreen> createState() => _LensPowerScreenState();
}

class _LensPowerScreenState extends State<LensPowerScreen> {
  double _rSph = -1.25, _rCyl = -0.50, _lSph = -1.75, _lCyl = -0.75;
  int _rAxis = 180, _lAxis = 170;
  final double _pd = 62.0;

  final _sphValues = List.generate(25, (i) => (i * -0.25).toStringAsFixed(2));
  final _cylValues = List.generate(13, (i) => (i * -0.25).toStringAsFixed(2));

  @override
  Widget build(BuildContext context) {
    final wizard = context.watch<LensWizardState>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Enter Your Power', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: AppColors.white), onPressed: () => Navigator.pop(context)),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const LensStepBar(currentStep: 2),
            if (wizard.product != null)
              _MiniProductCard2(wizard: wizard),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ENTER YOUR POWER', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 1)),
                  const Text('All fields are required', style: TextStyle(color: AppColors.muted, fontSize: 12)),
                ],
              ),
            ),
            // Prescription table
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                child: Column(
                  children: [
                    // Header row
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      child: Row(
                        children: const [
                          SizedBox(width: 28),
                          Expanded(child: Text('SPH', style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.center)),
                          Expanded(child: Text('CYL', style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.center)),
                          Expanded(child: Text('AXIS', style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.bold, fontSize: 12), textAlign: TextAlign.center)),
                        ],
                      ),
                    ),
                    const Divider(color: AppColors.border, height: 1),
                    // Right eye
                    _PowerRow(
                      label: 'R',
                      sph: _rSph.toStringAsFixed(2),
                      cyl: _rCyl.toStringAsFixed(2),
                      axis: _rAxis.toString(),
                      onSphTap: () => _showPicker(context, _sphValues, _rSph.toStringAsFixed(2), (v) => setState(() => _rSph = double.parse(v))),
                      onCylTap: () => _showPicker(context, _cylValues, _rCyl.toStringAsFixed(2), (v) => setState(() => _rCyl = double.parse(v))),
                      onAxisTap: () => _showAxisPicker(context, _rAxis, (v) => setState(() => _rAxis = v)),
                    ),
                    const Divider(color: AppColors.border, height: 1),
                    // Left eye
                    _PowerRow(
                      label: 'L',
                      sph: _lSph.toStringAsFixed(2),
                      cyl: _lCyl.toStringAsFixed(2),
                      axis: _lAxis.toString(),
                      onSphTap: () => _showPicker(context, _sphValues, _lSph.toStringAsFixed(2), (v) => setState(() => _lSph = double.parse(v))),
                      onCylTap: () => _showPicker(context, _cylValues, _lCyl.toStringAsFixed(2), (v) => setState(() => _lCyl = double.parse(v))),
                      onAxisTap: () => _showAxisPicker(context, _lAxis, (v) => setState(() => _lAxis = v)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // PD row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                child: Row(
                  children: [
                    const Icon(Icons.remove_red_eye_outlined, color: AppColors.gold, size: 20),
                    const SizedBox(width: 10),
                    const Expanded(child: Text('PD (Pupillary Distance)', style: TextStyle(color: AppColors.white, fontSize: 14))),
                    GestureDetector(
                      onTap: () {},
                      child: Text('${_pd.toStringAsFixed(1)} mm', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                    const SizedBox(width: 12),
                    GestureDetector(
                      onTap: () {},
                      child: const Text('Measure PD', style: TextStyle(color: AppColors.gold, fontSize: 12, decoration: TextDecoration.underline)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Upload prescription
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: const [
                  Icon(Icons.cloud_upload_outlined, color: AppColors.gold, size: 18),
                  SizedBox(width: 8),
                  Text("Don't have prescription? ", style: AppTextStyles.muted),
                  Text('Upload Prescription', style: TextStyle(color: AppColors.gold, decoration: TextDecoration.underline, fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GoldButton(
                label: 'CONTINUE TO QUALITY →',
                onPressed: () {
                  context.read<LensWizardState>().setPower(
                    re: PowerData(sph: _rSph, cyl: _rCyl, axis: _rAxis),
                    le: PowerData(sph: _lSph, cyl: _lCyl, axis: _lAxis),
                    pupillaryDistance: _pd,
                  );
                  Navigator.push(context, MaterialPageRoute(
                    builder: (_) => ChangeNotifierProvider.value(
                      value: context.read<LensWizardState>(),
                      child: const LensQualityScreen(),
                    ),
                  ));
                },
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _showPicker(BuildContext context, List<String> values, String current, Function(String) onSelect) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      builder: (_) => SizedBox(
        height: 250,
        child: Column(
          children: [
            const SizedBox(height: 8),
            const Text('Select Value', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold)),
            Expanded(
              child: ListView.builder(
                itemCount: values.length,
                itemBuilder: (_, i) => ListTile(
                  title: Text(values[i], style: TextStyle(color: values[i] == current ? AppColors.gold : AppColors.white)),
                  onTap: () { onSelect(values[i]); Navigator.pop(context); },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAxisPicker(BuildContext context, int current, Function(int) onSelect) {
    final vals = List.generate(181, (i) => i.toString());
    _showPicker(context, vals, current.toString(), (v) => onSelect(int.parse(v)));
  }
}

class _PowerRow extends StatelessWidget {
  final String label, sph, cyl, axis;
  final VoidCallback onSphTap, onCylTap, onAxisTap;

  const _PowerRow({required this.label, required this.sph, required this.cyl, required this.axis, required this.onSphTap, required this.onCylTap, required this.onAxisTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          SizedBox(
            width: 28,
            child: Text(label, style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 14)),
          ),
          Expanded(child: _DropCell(value: sph, onTap: onSphTap)),
          Expanded(child: _DropCell(value: cyl, onTap: onCylTap)),
          Expanded(child: _DropCell(value: axis, onTap: onAxisTap)),
        ],
      ),
    );
  }
}

class _DropCell extends StatelessWidget {
  final String value;
  final VoidCallback onTap;
  const _DropCell({required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(value, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w600, fontSize: 13)),
          const Icon(Icons.keyboard_arrow_down, color: AppColors.muted, size: 14),
        ],
      ),
    ),
  );
}

class _MiniProductCard2 extends StatelessWidget {
  final LensWizardState wizard;
  const _MiniProductCard2({required this.wizard});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.visibility_outlined, color: AppColors.muted, size: 24),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${wizard.product?.sku} | ${wizard.product?.name}', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                Text('${wizard.selectedColor} • Size: ${wizard.sizeString}', style: AppTextStyles.muted),
                Row(
                  children: [
                    const Text('Lens: ', style: AppTextStyles.muted),
                    Text(wizard.lensType ?? 'Not Selected', style: const TextStyle(color: AppColors.gold, fontSize: 12)),
                    const SizedBox(width: 6),
                    const Text('Edit', style: TextStyle(color: AppColors.muted, fontSize: 11, decoration: TextDecoration.underline)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

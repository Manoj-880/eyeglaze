import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/product.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/eyeglaze_logo.dart';
import '../../widgets/trust_strip.dart';
import '../../widgets/lens_wizard_state.dart';
import '../lens/lens_type_screen.dart';
import '../../widgets/responsive_container.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _selectedColorIdx = 0;
  int _currentImage = 0;

  Product get p => widget.product;

  String get selectedColorName =>
      p.colors.isNotEmpty ? p.colors[_selectedColorIdx].name : 'Default';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: AppColors.white), onPressed: () => Navigator.pop(context)),
        title: const EyeGlazeLogo(),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.search, color: AppColors.white), onPressed: () {}),
          IconButton(icon: const Icon(Icons.favorite_outline, color: AppColors.white), onPressed: () {}),
          Stack(
            children: [
              IconButton(icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.white), onPressed: () {}),
              Positioned(right: 8, top: 8, child: Container(
                width: 14, height: 14,
                decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle),
                child: const Center(child: Text('0', style: TextStyle(color: Colors.white, fontSize: 8))),
              )),
            ],
          ),
        ],
      ),
      body: ResponsiveContainer(
        maxWidth: 600,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image carousel
            _ImageCarousel(product: p, currentIndex: _currentImage, onChanged: (i) => setState(() => _currentImage = i)),
            // Thumbnail strip
            _ThumbnailStrip(count: 5, selected: _currentImage, onTap: (i) => setState(() => _currentImage = i)),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product name
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(text: p.sku, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 18)),
                        const TextSpan(text: '  |  ', style: TextStyle(color: AppColors.muted, fontSize: 18)),
                        TextSpan(text: p.name, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w700, fontSize: 16)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Rating
                  Row(
                    children: [
                      Row(children: List.generate(5, (i) => Icon(i < p.rating.floor() ? Icons.star : (i < p.rating ? Icons.star_half : Icons.star_outline), color: AppColors.gold, size: 16))),
                      const SizedBox(width: 6),
                      Text('${p.rating}', style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold)),
                      Text('  ${p.reviewCount} reviews', style: AppTextStyles.muted),
                      const Spacer(),
                      Text('${p.soldCount}+ bought this week', style: const TextStyle(color: AppColors.muted, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Share / Wishlist
                  Row(
                    children: [
                      TextButton.icon(icon: const Icon(Icons.share, color: AppColors.muted, size: 16), label: const Text('Share', style: TextStyle(color: AppColors.muted)), onPressed: () {}),
                      const SizedBox(width: 8),
                      TextButton.icon(icon: const Icon(Icons.favorite_outline, color: AppColors.muted, size: 16), label: const Text('Wishlist', style: TextStyle(color: AppColors.muted)), onPressed: () {}),
                    ],
                  ),
                  // Price block
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Frame Starting', style: AppTextStyles.muted),
                        const SizedBox(height: 6),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text('₹${p.sellingPrice.toInt()}', style: const TextStyle(color: AppColors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                            const SizedBox(width: 10),
                            Text('₹${p.originalPrice.toInt()}', style: const TextStyle(color: AppColors.muted, fontSize: 16, decoration: TextDecoration.lineThrough)),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(6)),
                              child: const Text('50% OFF', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.border)),
                                child: const Row(
                                  children: [
                                    Icon(Icons.local_shipping_outlined, color: AppColors.gold, size: 16),
                                    SizedBox(width: 6),
                                    Expanded(child: Text('Fast Delivery\n2-4 Days', style: TextStyle(color: AppColors.white, fontSize: 11))),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.border)),
                                child: const Row(
                                  children: [
                                    Icon(Icons.currency_rupee, color: AppColors.gold, size: 16),
                                    SizedBox(width: 6),
                                    Expanded(child: Text('Just ₹99\nDelivery Charge', style: TextStyle(color: AppColors.white, fontSize: 11))),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Color selector
                  Text('Select Color: $selectedColorName', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 10),
                  if (p.colors.isNotEmpty)
                    Wrap(
                      spacing: 10,
                      children: p.colors.asMap().entries.map((e) {
                        final isSelected = e.key == _selectedColorIdx;
                        final color = e.value;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedColorIdx = e.key),
                          child: Container(
                            width: 32, height: 32,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(int.parse(color.hex.replaceFirst('#', 'FF'), radix: 16)),
                              border: Border.all(color: isSelected ? AppColors.gold : AppColors.border, width: isSelected ? 2.5 : 1),
                            ),
                            child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 16) : null,
                          ),
                        );
                      }).toList(),
                    ),
                  const SizedBox(height: 16),
                  // Specs
                  if (p.frame != null) _FrameSpecs(frame: p.frame!),
                  const SizedBox(height: 16),
                  // Frame details card
                  if (p.frame != null) _FrameDetails(frame: p.frame!, compatible: p.compatible),
                  const SizedBox(height: 20),
                ],
              ),
            ),
            const TrustStrip(),
            // AI help banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                child: Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: AppColors.gold, size: 22),
                    const SizedBox(width: 10),
                    const Expanded(child: Text('Need Help? Chat with our AI Assistant', style: TextStyle(color: AppColors.white, fontSize: 13))),
                    GestureDetector(
                      onTap: () {},
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(border: Border.all(color: AppColors.gold), borderRadius: BorderRadius.circular(8)),
                        child: const Text('CHAT NOW', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 100), // space for sticky bottom
          ],
        ),
      ),
      ),
      // Sticky bottom CTA bar
      bottomNavigationBar: ResponsiveContainer(
        maxWidth: 600,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.card,
            border: const Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('₹${p.sellingPrice.toInt()}', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 18)),
                  const Text('50% OFF', style: TextStyle(color: AppColors.gold, fontSize: 11)),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: _addToCart,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.white,
                    side: const BorderSide(color: AppColors.gold),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    minimumSize: Size.zero,
                  ),
                  child: const Text('ADD TO CART', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: _buyWithLens,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('BUY WITH LENS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _addToCart() async {
    try {
      final authService = context.read<AuthService>();
      final api = ApiService(authService);
      await api.addToCart({
        'productId': p.id,
        'qty': 1,
        'color': selectedColorName,
        'framePrice': p.sellingPrice,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Added to cart!'),
          backgroundColor: AppColors.gold,
        ));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
  }

  void _buyWithLens() {
    final wizardState = LensWizardState();
    wizardState.setProduct(p, selectedColorName);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChangeNotifierProvider.value(
          value: wizardState,
          child: const LensTypeScreen(),
        ),
      ),
    );
  }
}

class _ImageCarousel extends StatelessWidget {
  final Product product;
  final int currentIndex;
  final Function(int) onChanged;

  const _ImageCarousel({required this.product, required this.currentIndex, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 260,
          color: AppColors.card,
          child: Center(
            child: Icon(Icons.visibility_outlined, color: AppColors.muted, size: 80),
          ),
        ),
        if (product.isBestseller)
          Positioned(
            top: 12, left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(6)),
              child: const Text('BESTSELLER', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
            ),
          ),
        Positioned(
          top: 12, right: 12,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: AppColors.card.withValues(alpha: 0.9), border: Border.all(color: AppColors.gold), borderRadius: BorderRadius.circular(6)),
            child: const Text('360° VIEW', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ),
        Positioned(
          left: 8,
          bottom: 0, top: 0,
          child: Center(
            child: GestureDetector(
              onTap: () => onChanged(currentIndex > 0 ? currentIndex - 1 : 4),
              child: Container(
                width: 28, height: 28,
                decoration: const BoxDecoration(color: AppColors.card, shape: BoxShape.circle),
                child: const Icon(Icons.chevron_left, color: AppColors.white, size: 20),
              ),
            ),
          ),
        ),
        Positioned(
          right: 8,
          bottom: 0, top: 0,
          child: Center(
            child: GestureDetector(
              onTap: () => onChanged(currentIndex < 4 ? currentIndex + 1 : 0),
              child: Container(
                width: 28, height: 28,
                decoration: const BoxDecoration(color: AppColors.card, shape: BoxShape.circle),
                child: const Icon(Icons.chevron_right, color: AppColors.white, size: 20),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ThumbnailStrip extends StatelessWidget {
  final int count;
  final int selected;
  final Function(int) onTap;

  const _ThumbnailStrip({required this.count, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: List.generate(count, (i) {
          final isSelected = i == selected;
          return Expanded(
            child: GestureDetector(
              onTap: () => onTap(i),
              child: Container(
                margin: const EdgeInsets.only(right: 6),
                height: 50,
                decoration: BoxDecoration(
                  color: AppColors.card,
                  border: Border.all(color: isSelected ? AppColors.gold : AppColors.border, width: isSelected ? 2 : 1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: i == count - 1
                    ? const Icon(Icons.person, color: AppColors.muted, size: 20)
                    : const Icon(Icons.visibility_outlined, color: AppColors.muted, size: 16),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _FrameSpecs extends StatelessWidget {
  final ProductFrame frame;
  const _FrameSpecs({required this.frame});

  @override
  Widget build(BuildContext context) {
    final specs = [
      {'icon': Icons.straighten, 'label': 'Frame Width', 'value': '${frame.width?.toInt() ?? 0}mm'},
      {'icon': Icons.remove_red_eye_outlined, 'label': 'Lens Width', 'value': '${frame.lensWidth?.toInt() ?? 0}mm'},
      {'icon': Icons.linear_scale, 'label': 'Bridge', 'value': '${frame.bridgeWidth?.toInt() ?? 0}mm'},
      {'icon': Icons.height, 'label': 'Temple', 'value': '${frame.templeLength?.toInt() ?? 0}mm'},
    ];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: specs.map((s) => Expanded(
          child: Column(
            children: [
              Icon(s['icon'] as IconData, color: AppColors.gold, size: 18),
              const SizedBox(height: 4),
              Text(s['value'] as String, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              Text(s['label'] as String, style: const TextStyle(color: AppColors.muted, fontSize: 10), textAlign: TextAlign.center),
            ],
          ),
        )).toList(),
      ),
    );
  }
}

class _FrameDetails extends StatelessWidget {
  final ProductFrame frame;
  final ProductCompatible? compatible;
  const _FrameDetails({required this.frame, this.compatible});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.shield_outlined, color: AppColors.gold, size: 18),
              SizedBox(width: 8),
              Text('Frame Details', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              Spacer(),
              Text('VIEW DETAILS', style: TextStyle(color: AppColors.gold, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 12),
          _DetailRow('Frame Type', frame.type ?? '-'),
          _DetailRow('Material', frame.material ?? '-'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 6,
            children: frame.featureTags.map((tag) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppColors.background, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(20)),
              child: Text(tag, style: const TextStyle(color: AppColors.muted, fontSize: 11)),
            )).toList(),
          ),
          if (compatible != null) ...[
            const SizedBox(height: 12),
            const Divider(color: AppColors.border),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.check_circle_outline, color: AppColors.success, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Compatible with ${[
                      if (compatible!.prescription) 'Prescription Lenses',
                      if (compatible!.bluecut) 'Blue Cut',
                      if (compatible!.zeropower) 'Zero Power',
                      if (compatible!.progressive) 'Progressive',
                    ].join(' • ')}',
                    style: const TextStyle(color: AppColors.muted, fontSize: 12),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      children: [
        Text('$label: ', style: AppTextStyles.muted),
        Text(value, style: const TextStyle(color: AppColors.white, fontSize: 13)),
      ],
    ),
  );
}

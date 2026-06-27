import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_config.dart';
import '../../core/theme.dart';
import '../../models/cart_item.dart';
import '../../services/cart_provider.dart';
import '../../widgets/gold_button.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CartProvider>().loadCart();
    });
  }

  Future<void> _removeItem(String itemId) async {
    await context.read<CartProvider>().removeFromCart(itemId);
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final items = cart.items;
    final loading = cart.isLoading;
    final subtotal = cart.subtotal;
    final delivery = cart.delivery;
    final total = cart.total;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        title: const Text('My Cart', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
        actions: const [],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('🛒', style: TextStyle(fontSize: 60)),
                      const SizedBox(height: 16),
                      const Text('Your cart is empty', style: TextStyle(color: AppColors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      const Text('Add some frames to get started', style: TextStyle(color: AppColors.muted)),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: 200,
                        child: GoldButton(
                          label: 'SHOP NOW',
                          onPressed: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: items.length,
                        itemBuilder: (_, i) => _CartItemCard(
                          item: items[i],
                          onRemove: () => _removeItem(items[i].id),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        color: AppColors.card,
                        border: Border(top: BorderSide(color: AppColors.border)),
                      ),
                      child: Column(
                        children: [
                          _PriceRow('Subtotal', '₹${subtotal.toInt()}'),
                          _PriceRow('Delivery Charge', '₹${delivery.toInt()}'),
                          const Divider(color: AppColors.border),
                          Row(
                            children: [
                              const Text('Total', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                              const Spacer(),
                              Text('₹${total.toInt()}', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          GoldButton(
                            label: 'PROCEED TO CHECKOUT',
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const CheckoutScreen()),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}

class _CartItemCard extends StatelessWidget {
  final CartItem item;
  final VoidCallback onRemove;

  const _CartItemCard({required this.item, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 60, height: 60,
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8)),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: item.product != null && item.product!.images.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: AppConfig.resolveImageUrl(item.product!.images.first),
                      fit: BoxFit.contain,
                      placeholder: (context, url) => const Center(
                        child: SizedBox(
                          width: 20, height: 20,
                          child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 1.5),
                        ),
                      ),
                      errorWidget: (context, url, error) => const Icon(Icons.broken_image_outlined, color: AppColors.muted, size: 24),
                    )
                  : const Icon(Icons.visibility_outlined, color: AppColors.muted, size: 30),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.product?.name ?? 'Frame', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w700)),
                if (item.selectedColor != null) Text('Color: ${item.selectedColor}', style: AppTextStyles.muted),
                if (item.lensType != null) ...[
                  Text('Lens: ${item.lensType}', style: AppTextStyles.muted),
                  if (item.lensSubType != null) Text('Option: ${item.lensSubType}', style: AppTextStyles.muted),
                  if (item.lensQuality != null) Text('Quality: ${item.lensQuality}', style: AppTextStyles.muted),
                  if (item.lensConfig != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(
                          'RE (S:${item.lensConfig!.re?.sph ?? 0.0}, C:${item.lensConfig!.re?.cyl ?? 0.0}, A:${item.lensConfig!.re?.axis ?? 0})\n'
                          'LE (S:${item.lensConfig!.le?.sph ?? 0.0}, C:${item.lensConfig!.le?.cyl ?? 0.0}, A:${item.lensConfig!.le?.axis ?? 0})\n'
                          'PD: ${item.lensConfig!.pd ?? 0.0}',
                          style: TextStyle(color: AppColors.gold.withValues(alpha: 0.9), fontSize: 9, height: 1.3),
                        ),
                      ),
                    ),
                ],
                const SizedBox(height: 6),
                Text('₹${item.totalPrice.toInt()}', style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.w900, fontSize: 16)),
              ],
            ),
          ),
          IconButton(icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20), onPressed: onRemove),
        ],
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  const _PriceRow(this.label, this.value);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      children: [
        Text(label, style: AppTextStyles.muted),
        const Spacer(),
        Text(value, style: const TextStyle(color: AppColors.white, fontSize: 14)),
      ],
    ),
  );
}

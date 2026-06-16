import 'package:flutter/material.dart';
import '../core/theme.dart';

class TrustStrip extends StatelessWidget {
  const TrustStrip({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      {'icon': Icons.shield_outlined, 'label': '100% Secure\nPayment'},
      {'icon': Icons.verified_outlined, 'label': '1 Year\nWarranty'},
      {'icon': Icons.replay_outlined, 'label': 'Easy\nReturns'},
      {'icon': Icons.local_shipping_outlined, 'label': 'Fast\nDelivery'},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: items.map((item) {
          return Expanded(
            child: Column(
              children: [
                Icon(item['icon'] as IconData, color: AppColors.gold, size: 22),
                const SizedBox(height: 6),
                Text(
                  item['label'] as String,
                  style: const TextStyle(color: AppColors.muted, fontSize: 10),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

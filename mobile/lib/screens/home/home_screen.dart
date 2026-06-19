import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../widgets/eyeglaze_logo.dart';
import '../products/products_screen.dart';
import '../cart/cart_screen.dart';
import '../orders/orders_screen.dart';
import '../account/account_screen.dart';
import '../../widgets/responsive_container.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTab = 0;

  final List<Widget> _tabs = const [
    _HomeBody(),
    _PlaceholderScreen(label: 'Categories'),
    _PlaceholderScreen(label: 'Wishlist'),
    OrdersScreen(),
    AccountScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: AppColors.white),
          onPressed: () {},
        ),
        title: const EyeGlazeLogo(),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.search, color: AppColors.white), onPressed: () {}),
          Stack(
            children: [
              IconButton(icon: const Icon(Icons.notifications_outlined, color: AppColors.white), onPressed: () {}),
              Positioned(
                right: 8, top: 8,
                child: Container(
                  width: 14, height: 14,
                  decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle),
                  child: const Center(child: Text('3', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold))),
                ),
              ),
            ],
          ),
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.white),
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen())),
              ),
              Positioned(
                right: 8, top: 8,
                child: Container(
                  width: 14, height: 14,
                  decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle),
                  child: const Center(child: Text('0', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold))),
                ),
              ),
            ],
          ),
        ],
      ),
      body: ResponsiveContainer(
        maxWidth: 600,
        child: _tabs[_currentTab],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTab,
        onTap: (i) => setState(() => _currentTab = i),
        backgroundColor: AppColors.card,
        selectedItemColor: AppColors.gold,
        unselectedItemColor: AppColors.muted,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.grid_view_outlined), label: 'Categories'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_outline), label: 'Wishlist'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_outlined), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Account'),
        ],
      ),
    );
  }
}

class _HomeBody extends StatefulWidget {
  const _HomeBody();

  @override
  State<_HomeBody> createState() => _HomeBodyState();
}

class _HomeBodyState extends State<_HomeBody> {
  int _heroIndex = 0;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _HeroBanner(
            currentIndex: _heroIndex,
            onChanged: (i) => setState(() => _heroIndex = i),
          ),
          _HomeTrustStrip(),
          _CategorySection(onTap: (cat) {
            Navigator.push(context, MaterialPageRoute(
              builder: (_) => ProductsScreen(category: cat),
            ));
          }),
          _PromoBanners(),
          _QuickActionDock(),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _HeroBanner extends StatelessWidget {
  final int currentIndex;
  final Function(int) onChanged;

  const _HeroBanner({required this.currentIndex, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        height: 220,
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.gold),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('— SEE THE WORLD', style: TextStyle(color: AppColors.gold, fontSize: 11, letterSpacing: 1)),
                  ),
                  const SizedBox(height: 12),
                  const Text('CLEARER.\nSHARPER. YOU.', style: TextStyle(color: AppColors.white, fontSize: 26, fontWeight: FontWeight.w900, height: 1.15)),
                  const SizedBox(height: 8),
                  const Text('Premium Eyewear for Every Version of You.', style: TextStyle(color: AppColors.muted, fontSize: 12)),
                  const Spacer(),
                  OutlinedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProductsScreen())),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.gold,
                      side: const BorderSide(color: AppColors.gold),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                    child: const Text('SHOP NOW →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            Positioned(
              bottom: 12,
              right: 16,
              child: Row(
                children: List.generate(4, (i) => Container(
                  margin: const EdgeInsets.only(left: 4),
                  width: i == currentIndex ? 16 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: i == currentIndex ? AppColors.gold : AppColors.border,
                    borderRadius: BorderRadius.circular(3),
                  ),
                )),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeTrustStrip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = [
      {'icon': Icons.verified_outlined, 'label': '100%\nAuthentic'},
      {'icon': Icons.star_outline, 'label': 'Premium\nQuality'},
      {'icon': Icons.replay, 'label': '7 Days\nReturn'},
      {'icon': Icons.local_shipping_outlined, 'label': 'Free\nShipping'},
    ];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: items.map((item) => Column(
            children: [
              Icon(item['icon'] as IconData, color: AppColors.gold, size: 20),
              const SizedBox(height: 4),
              Text(item['label'] as String, style: const TextStyle(color: AppColors.muted, fontSize: 10), textAlign: TextAlign.center),
            ],
          )).toList(),
        ),
      ),
    );
  }
}

class _CategorySection extends StatelessWidget {
  final Function(String) onTap;

  const _CategorySection({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final categories = [
      {'label': 'Prescription\nGlasses', 'icon': Icons.visibility_outlined},
      {'label': 'Sunglasses', 'icon': Icons.wb_sunny_outlined},
      {'label': 'Blue Light\nGlasses', 'icon': Icons.phone_android},
      {'label': 'Contact\nLenses', 'icon': Icons.lens_outlined},
      {'label': 'Kids\nEyewear', 'icon': Icons.child_care},
    ];

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Text('Shop by Category', style: AppTextStyles.heading3),
              const Spacer(),
              GestureDetector(
                onTap: () => onTap(''),
                child: const Text('View All ›', style: AppTextStyles.gold),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 90,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: categories.length,
            itemBuilder: (_, i) {
              final cat = categories[i];
              return GestureDetector(
                onTap: () => onTap(cat['label'] as String),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Column(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Icon(cat['icon'] as IconData, color: AppColors.gold, size: 24),
                      ),
                      const SizedBox(height: 6),
                      SizedBox(
                        width: 64,
                        child: Text(
                          cat['label'] as String,
                          style: const TextStyle(color: AppColors.muted, fontSize: 10),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _PromoBanners extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 140,
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('UP TO', style: TextStyle(color: AppColors.muted, fontSize: 11)),
                  const Text('50% OFF', style: TextStyle(color: AppColors.gold, fontSize: 20, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  const Text('On Selected\nSunglasses', style: TextStyle(color: AppColors.white, fontSize: 11), maxLines: 2),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(6)),
                    child: const Text('SHOP NOW', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              height: 140,
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.gold, width: 0.5),
              ),
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('NEW', style: TextStyle(color: AppColors.gold, fontSize: 11, fontWeight: FontWeight.bold)),
                  const Text('ARRIVALS', style: TextStyle(color: AppColors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  const Text('Just In! Latest\ntrends in eyewear', style: TextStyle(color: AppColors.muted, fontSize: 11), maxLines: 2),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(border: Border.all(color: AppColors.gold), borderRadius: BorderRadius.circular(6)),
                    child: const Text('EXPLORE', style: TextStyle(color: AppColors.gold, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionDock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final actions = [
      {'icon': Icons.face_retouching_natural, 'label': 'Try On\nVirtual', 'highlight': false},
      {'icon': Icons.straighten, 'label': 'Perfect\nFit', 'highlight': false},
      {'icon': Icons.auto_awesome, 'label': 'AI\nAssistant', 'highlight': true},
      {'icon': Icons.upload_file, 'label': 'Upload\nRx', 'highlight': false},
      {'icon': Icons.local_shipping, 'label': 'Track\nOrder', 'highlight': false},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: actions.map((a) {
            final highlight = a['highlight'] as bool;
            return Column(
              children: [
                Container(
                  width: highlight ? 56 : 44,
                  height: highlight ? 56 : 44,
                  decoration: BoxDecoration(
                    color: highlight ? AppColors.gold : AppColors.background,
                    shape: BoxShape.circle,
                    border: highlight ? null : Border.all(color: AppColors.border),
                  ),
                  child: Icon(a['icon'] as IconData, color: highlight ? Colors.white : AppColors.gold, size: highlight ? 26 : 20),
                ),
                const SizedBox(height: 6),
                Text(a['label'] as String, style: const TextStyle(color: AppColors.muted, fontSize: 9), textAlign: TextAlign.center),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  final String label;
  const _PlaceholderScreen({required this.label});

  @override
  Widget build(BuildContext context) => Center(
    child: Text(label, style: AppTextStyles.heading2),
  );
}

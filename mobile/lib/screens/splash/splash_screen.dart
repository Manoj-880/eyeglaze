import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme.dart';
import '../../services/auth_service.dart';
import '../home/home_screen.dart';
import '../auth/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  // Selection of premium network image URLs focusing strictly on eyes and spectacles
  final List<List<String>> _columnImages = [
    [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=300',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=300',
      'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=300',
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=300',
    ],
    [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=300',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=300',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=300',
      'https://images.unsplash.com/photo-1502764613149-7f1d229fe230?q=80&w=300',
    ],
    [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=300',
      'https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=300',
      'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=300',
      'https://images.unsplash.com/photo-1504701954957-2390f80649b6?q=80&w=300',
    ],
    [
      'https://images.unsplash.com/photo-1614713570247-ef995c73c8b8?q=80&w=300',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=300',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=300',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=300',
    ],
  ];

  @override
  void initState() {
    super.initState();
    // Continuous animation driving the infinite scroll
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 25),
    )..repeat();

    _initAuth();
  }

  Future<void> _initAuth() async {
    final authService = context.read<AuthService>();
    await authService.init();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final columnWidth = screenWidth / 4;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background - 4 Infinite scrolling columns of eyewear images
          Row(
            children: [
              _buildScrollingColumn(
                images: _columnImages[0],
                speedMultiplier: 1.0,
                startShift: 0.0,
                width: columnWidth,
              ),
              _buildScrollingColumn(
                images: _columnImages[1],
                speedMultiplier: 0.7,
                startShift: 0.25,
                width: columnWidth,
              ),
              _buildScrollingColumn(
                images: _columnImages[2],
                speedMultiplier: 1.2,
                startShift: 0.5,
                width: columnWidth,
              ),
              _buildScrollingColumn(
                images: _columnImages[3],
                speedMultiplier: 0.9,
                startShift: 0.75,
                width: columnWidth,
              ),
            ],
          ),
          // Dark styling gradient overlay to blend into black background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.background.withValues(alpha: 0.92),
                  AppColors.background.withValues(alpha: 0.78),
                  AppColors.background.withValues(alpha: 0.92),
                ],
              ),
            ),
          ),
          // Clean layout: Gold brand logo floating directly in center, GET STARTED button below it
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                children: [
                  const Spacer(flex: 3),
                  // The gold EyeGlaze logo image uploaded by the user
                  Image.asset(
                    'assets/images/logo.png',
                    height: 100,
                    fit: BoxFit.contain,
                  ),
                  const Spacer(flex: 2),
                  // Capsule GET STARTED button directly below
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: () {
                        final authService = context.read<AuthService>();
                        Navigator.pushReplacement(
                          context,
                          PageRouteBuilder(
                            pageBuilder: (context, animation, secondaryAnimation) =>
                                authService.isLoggedIn ? const HomeScreen() : const LoginScreen(),
                            transitionsBuilder: (context, animation, secondaryAnimation, child) {
                              return FadeTransition(opacity: animation, child: child);
                            },
                            transitionDuration: const Duration(milliseconds: 800),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.gold,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        elevation: 5,
                        shadowColor: AppColors.gold.withValues(alpha: 0.3),
                      ),
                      child: const Text(
                        'GET STARTED',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 48),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScrollingColumn({
    required List<String> images,
    required double speedMultiplier,
    required double startShift,
    required double width,
  }) {
    final double itemHeight = 160.0;
    final double totalHeight = itemHeight * images.length;

    return SizedBox(
      width: width,
      height: double.infinity,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          // Scroll from top to bottom (progress runs 0.0 to 1.0)
          final double progress = (_controller.value * speedMultiplier + startShift) % 1.0;
          final double yOffset = progress * totalHeight;

          return Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: -totalHeight + yOffset,
                left: 0,
                right: 0,
                child: Column(
                  children: _buildImageList(images, itemHeight),
                ),
              ),
              Positioned(
                top: yOffset,
                left: 0,
                right: 0,
                child: Column(
                  children: _buildImageList(images, itemHeight),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _buildImageList(List<String> images, double height) {
    return images.map((url) {
      return Container(
        height: height - 8.0,
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.3), width: 0.5),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: CachedNetworkImage(
            imageUrl: url,
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(
              color: AppColors.card,
              child: Center(
                child: Icon(
                  Icons.visibility_outlined,
                  color: AppColors.muted.withValues(alpha: 0.5),
                  size: 20,
                ),
              ),
            ),
            errorWidget: (context, url, error) => Container(
              color: AppColors.card,
              child: const Icon(Icons.broken_image_outlined, color: AppColors.muted, size: 20),
            ),
          ),
        ),
      );
    }).toList();
  }
}

import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../widgets/responsive_container.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('TERMS & PRIVACY', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 2)),
      ),
      body: ResponsiveContainer(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSection('Terms of Service', _termsContent),
              const SizedBox(height: 24),
              _buildSection('Return Policy', _returnPolicyContent),
              const SizedBox(height: 24),
              _buildSection('Privacy Policy', _privacyContent),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> content) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: const TextStyle(color: AppColors.gold, fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 2),
          ),
          const SizedBox(height: 16),
          ...content,
        ],
      ),
    );
  }

  List<Widget> get _termsContent => [
        _buildParagraph('Welcome to EyeGlaze! By using our services, you agree to the following terms and conditions.'),
        _buildSubheading('1. Acceptance of Terms'),
        _buildParagraph('By accessing and using EyeGlaze\'s mobile application and website, you accept and agree to be bound by these Terms of Service.'),
        _buildSubheading('2. Product Descriptions'),
        _buildParagraph('We strive to provide accurate product descriptions and images. However, we do not warrant that descriptions or other content are accurate, complete, reliable, current, or error-free.'),
        _buildSubheading('3. Pricing'),
        _buildParagraph('All prices are subject to change without notice. We reserve the right to modify or discontinue any product without notice.'),
        _buildSubheading('4. Orders'),
        _buildParagraph('We reserve the right to refuse or cancel any order for any reason at our sole discretion.'),
      ];

  List<Widget> get _returnPolicyContent => [
        _buildParagraph('Our goal is to ensure your complete satisfaction with your purchase.'),
        _buildSubheading('Return Window'),
        _buildParagraph('You may return most items within 7 days of delivery for a full refund or exchange.'),
        _buildSubheading('Return Conditions'),
        _buildParagraph('Items must be unused, in original packaging, with all tags and accessories intact. Prescription glasses are non-returnable once the lenses have been made.'),
        _buildSubheading('Refund Process'),
        _buildParagraph('Refunds will be processed within 7-10 business days of receiving the returned item. The refund will be credited to your original payment method.'),
      ];

  List<Widget> get _privacyContent => [
        _buildParagraph('Your privacy is important to us. This policy explains how we collect, use, and protect your information.'),
        _buildSubheading('Information We Collect'),
        _buildParagraph('We collect information you provide directly, such as your name, email, phone number, shipping address, and payment information.'),
        _buildSubheading('How We Use Your Information'),
        _buildParagraph('We use your information to process orders, provide customer support, send updates, and improve our services.'),
        _buildSubheading('Data Security'),
        _buildParagraph('We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.'),
        _buildSubheading('Contact Us'),
        _buildParagraph('If you have questions about this Privacy Policy, please contact us at support@eyeglaze.com.'),
      ];

  Widget _buildSubheading(String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 12, bottom: 8),
      child: Text(
        text,
        style: const TextStyle(color: AppColors.white, fontSize: 15, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildParagraph(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(color: AppColors.muted, fontSize: 14, height: 1.6),
      ),
    );
  }
}

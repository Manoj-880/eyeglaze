import 'package:flutter/material.dart';
import '../core/theme.dart';

class EyeGlazeLogo extends StatelessWidget {
  final double size;
  const EyeGlazeLogo({super.key, this.size = 1.0});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'EYEGLAZE',
          style: AppTextStyles.logo.copyWith(fontSize: 22 * size),
        ),
        Text(
          'E Y E W E A R',
          style: AppTextStyles.logoSub.copyWith(fontSize: 10 * size),
        ),
      ],
    );
  }
}

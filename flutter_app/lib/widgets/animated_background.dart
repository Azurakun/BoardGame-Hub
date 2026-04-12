import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AnimatedBackground extends StatefulWidget {
  final Widget child;
  const AnimatedBackground({super.key, required this.child});

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final Random _random = Random();
  late List<_Ornament> _ornaments;

  final List<IconData> _icons = [
    LucideIcons.dice1, LucideIcons.dice3, LucideIcons.dice5,
    LucideIcons.hexagon, LucideIcons.star, LucideIcons.crown,
    LucideIcons.swords, LucideIcons.shield
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 40))..repeat();
    _ornaments = List.generate(15, (index) => _generateOrnament());
  }

  _Ornament _generateOrnament() {
    return _Ornament(
      icon: _icons[_random.nextInt(_icons.length)],
      startX: _random.nextDouble(),
      startY: _random.nextDouble(),
      speedX: (_random.nextDouble() - 0.5) * 0.05,
      speedY: (_random.nextDouble() - 0.5) * 0.05,
      size: _random.nextDouble() * 40 + 20,
      rotationSpeed: (_random.nextDouble() - 0.5) * 2,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = Theme.of(context).colorScheme.primary.withOpacity(isDark ? 0.05 : 0.03);

    return Stack(
      children: [
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return CustomPaint(
                painter: _OrnamentPainter(_ornaments, _controller.value, iconColor),
              );
            },
          ),
        ),
        widget.child,
      ],
    );
  }
}

class _Ornament {
  final IconData icon;
  final double startX;
  final double startY;
  final double speedX;
  final double speedY;
  final double size;
  final double rotationSpeed;

  _Ornament({required this.icon, required this.startX, required this.startY, required this.speedX, required this.speedY, required this.size, required this.rotationSpeed});
}

class _OrnamentPainter extends CustomPainter {
  final List<_Ornament> ornaments;
  final double progress;
  final Color color;

  _OrnamentPainter(this.ornaments, this.progress, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    for (var ornament in ornaments) {
      double x = (ornament.startX + (ornament.speedX * progress * 20)) % 1.0;
      double y = (ornament.startY + (ornament.speedY * progress * 20)) % 1.0;
      if (x < 0) x += 1;
      if (y < 0) y += 1;

      final double currentRotation = ornament.rotationSpeed * progress * pi * 2;

      final TextPainter textPainter = TextPainter(
        text: TextSpan(text: String.fromCharCode(ornament.icon.codePoint), style: TextStyle(fontSize: ornament.size, fontFamily: ornament.icon.fontFamily, package: ornament.icon.fontPackage, color: color)),
        textDirection: TextDirection.ltr,
      )..layout();

      canvas.save();
      canvas.translate(x * size.width, y * size.height);
      canvas.rotate(currentRotation);
      textPainter.paint(canvas, Offset(-ornament.size / 2, -ornament.size / 2));
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

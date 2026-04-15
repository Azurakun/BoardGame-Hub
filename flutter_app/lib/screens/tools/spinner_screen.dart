import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:math';

class SpinnerScreen extends StatefulWidget {
  const SpinnerScreen({super.key});

  @override
  State<SpinnerScreen> createState() => _SpinnerScreenState();
}

class _SpinnerScreenState extends State<SpinnerScreen> with SingleTickerProviderStateMixin {
  List<String> _segments = ['Yes', 'No'];
  String? _result;
  bool _isSpinning = false;
  late AnimationController _spinController;
  late Animation<double> _spinAnimation;
  double _currentAngle = 0;
  final List<String> _history = [];

  static const _segmentColors = [
    Color(0xFF6366F1), Color(0xFFEF4444), Color(0xFF10B981), Color(0xFFF59E0B),
    Color(0xFF06B6D4), Color(0xFFEC4899), Color(0xFF8B5CF6), Color(0xFFF97316),
    Color(0xFF14B8A6), Color(0xFF84CC16), Color(0xFFE11D48), Color(0xFF0891B2),
  ];

  static const _presets = {
    'Yes / No': ['Yes', 'No'],
    'Numbers 1-6': ['1', '2', '3', '4', '5', '6'],
    'Directions': ['North', 'East', 'South', 'West'],
    'Custom': <String>[],
  };
  String _selectedPreset = 'Yes / No';

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      duration: const Duration(milliseconds: 3000),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _spinController.dispose();
    super.dispose();
  }

  void _spin() {
    if (_isSpinning || _segments.isEmpty) return;

    setState(() {
      _isSpinning = true;
      _result = null;
    });

    final rng = Random();
    final extraTurns = 3 + rng.nextInt(3); // 3-5 full rotations
    final finalAngle = extraTurns * 2 * pi + rng.nextDouble() * 2 * pi;

    _spinAnimation = Tween<double>(begin: 0, end: finalAngle).animate(
      CurvedAnimation(parent: _spinController, curve: Curves.decelerate),
    );

    _spinAnimation.addListener(() {
      setState(() => _currentAngle = _spinAnimation.value);
    });

    _spinController.forward(from: 0).then((_) {
      // Calculate which segment the arrow points to
      final segmentAngle = 2 * pi / _segments.length;
      final normalizedAngle = (finalAngle % (2 * pi));
      // Arrow is at top (0), wheel rotates clockwise
      final pointerAngle = (2 * pi - normalizedAngle) % (2 * pi);
      final effectivePointerAngle = (pointerAngle + segmentAngle / 2) % (2 * pi);
      final segmentIndex = (effectivePointerAngle / segmentAngle).floor() % _segments.length;

      setState(() {
        _result = _segments[segmentIndex];
        _isSpinning = false;
        _history.insert(0, _result!);
        if (_history.length > 10) _history.removeLast();
      });
    });
  }

  void _addSegment() {
    if (_segments.length >= 12) return;
    setState(() => _segments.add('Segment ${_segments.length + 1}'));
  }

  void _removeSegment(int index) {
    if (_segments.length <= 2) return;
    setState(() => _segments.removeAt(index));
  }

  void _applyPreset(String key) {
    setState(() {
      _selectedPreset = key;
      if (key != 'Custom') {
        _segments = List<String>.from(_presets[key]!);
      }
      _result = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Spinner Wheel', style: TextStyle(fontWeight: FontWeight.bold))),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: constraints.maxHeight - 32,
                minWidth: constraints.maxWidth - 32,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
          children: [
            // Preset selector
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Presets', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 13)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _presets.keys.map((k) => ChoiceChip(
                        label: Text(k, style: const TextStyle(fontWeight: FontWeight.bold)),
                        selected: _selectedPreset == k,
                        selectedColor: cs.primary,
                        labelStyle: TextStyle(color: _selectedPreset == k ? cs.onPrimary : null),
                        onSelected: (_) => _applyPreset(k),
                      )).toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Wheel
            SizedBox(
              width: 280,
              height: 280,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Spinning wheel
                  Transform.rotate(
                    angle: _currentAngle,
                    child: CustomPaint(
                      size: const Size(260, 260),
                      painter: _WheelPainter(_segments, _segmentColors),
                    ),
                  ),
                  // Arrow pointer at top
                  Positioned(
                    top: 0,
                    child: Icon(LucideIcons.chevronDown, size: 32, color: cs.error),
                  ),
                  // Center button
                  GestureDetector(
                    onTap: _spin,
                    child: Container(
                      width: 56, height: 56,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: cs.primary,
                        boxShadow: [BoxShadow(color: cs.primary.withOpacity(0.3), blurRadius: 10)],
                      ),
                      child: Icon(
                        _isSpinning ? LucideIcons.loader2 : LucideIcons.play,
                        color: Colors.white, size: 24,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Result
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _result != null
                  ? Card(
                      key: ValueKey(_result),
                      color: cs.primary.withOpacity(0.1),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.target, color: cs.primary),
                            const SizedBox(width: 12),
                            Text(_result!, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: cs.primary)),
                          ],
                        ),
                      ),
                    )
                  : Text(
                      _isSpinning ? 'Spinning...' : 'Tap the center to spin!',
                      style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontWeight: FontWeight.bold),
                    ),
            ),

            const SizedBox(height: 16),

            // Segment editor
            if (_selectedPreset == 'Custom')
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('Segments', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 13)),
                          const Spacer(),
                          if (_segments.length < 12)
                            TextButton.icon(
                              onPressed: _addSegment,
                              icon: const Icon(LucideIcons.plus, size: 14),
                              label: const Text('Add', style: TextStyle(fontSize: 12)),
                            ),
                        ],
                      ),
                      ..._segments.asMap().entries.map((e) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          children: [
                            Container(
                              width: 16, height: 16,
                              decoration: BoxDecoration(
                                color: _segmentColors[e.key % _segmentColors.length],
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                controller: TextEditingController(text: e.value),
                                onChanged: (v) => _segments[e.key] = v.isEmpty ? 'Segment ${e.key + 1}' : v,
                                decoration: const InputDecoration(
                                  isDense: true,
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.symmetric(vertical: 8),
                                ),
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                            if (_segments.length > 2)
                              IconButton(
                                onPressed: () => _removeSegment(e.key),
                                icon: Icon(LucideIcons.x, size: 14, color: cs.error),
                              ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
              ),

            // History
            if (_history.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text('Spin History', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 13)),
                            const Spacer(),
                            GestureDetector(
                              onTap: () => setState(() => _history.clear()),
                              child: Text('Clear', style: TextStyle(fontSize: 12, color: cs.error)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: _history.asMap().entries.map((e) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: cs.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(e.value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: cs.primary)),
                          )).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  },
),
    );
  }
}

/// Custom painter for the spinner wheel segments.
class _WheelPainter extends CustomPainter {
  final List<String> segments;
  final List<Color> colors;

  _WheelPainter(this.segments, this.colors);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final segmentAngle = 2 * pi / segments.length;

    for (int i = 0; i < segments.length; i++) {
      final paint = Paint()..color = colors[i % colors.length];
      // Offset by -segmentAngle / 2 so the first segment is centered exactly at the top
      final startAngle = -pi / 2 - segmentAngle / 2 + i * segmentAngle;
      
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        segmentAngle,
        true,
        paint,
      );

      // Draw text
      final textAngle = startAngle + segmentAngle / 2;
      final textRadius = radius * 0.65;
      final textOffset = Offset(
        center.dx + textRadius * cos(textAngle),
        center.dy + textRadius * sin(textAngle),
      );

      final textPainter = TextPainter(
        text: TextSpan(
          text: segments[i].length > 8 ? '${segments[i].substring(0, 7)}…' : segments[i],
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();

      canvas.save();
      canvas.translate(textOffset.dx, textOffset.dy);
      canvas.rotate(textAngle + pi / 2);
      textPainter.paint(canvas, Offset(-textPainter.width / 2, -textPainter.height / 2));
      canvas.restore();
    }

    // Border
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;
    canvas.drawCircle(center, radius, borderPaint);

    // Segment dividers
    for (int i = 0; i < segments.length; i++) {
      final angle = -pi / 2 + i * segmentAngle;
      canvas.drawLine(
        center,
        Offset(center.dx + radius * cos(angle), center.dy + radius * sin(angle)),
        borderPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

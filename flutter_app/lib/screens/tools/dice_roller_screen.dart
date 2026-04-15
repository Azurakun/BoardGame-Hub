import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:math';

class DiceRollerScreen extends StatefulWidget {
  const DiceRollerScreen({super.key});

  @override
  State<DiceRollerScreen> createState() => _DiceRollerScreenState();
}

class _DiceRollerScreenState extends State<DiceRollerScreen> with SingleTickerProviderStateMixin {
  int _diceType = 6; // d4, d6, d8, d10, d12, d20
  int _diceCount = 1;
  List<int> _results = [1];
  List<List<int>> _history = [];
  bool _isRolling = false;
  bool _skipAnimation = false;
  late AnimationController _rollController;

  static const _diceTypes = [4, 6, 8, 10, 12, 20];

  @override
  void initState() {
    super.initState();
    _rollController = AnimationController(duration: const Duration(milliseconds: 600), vsync: this);
  }

  @override
  void dispose() {
    _rollController.dispose();
    super.dispose();
  }

  void _roll() async {
    if (_isRolling) return;
    setState(() => _isRolling = true);

    if (_skipAnimation) {
      final rng = Random();
      setState(() {
        _results = List.generate(_diceCount, (_) => rng.nextInt(_diceType) + 1);
        _history.insert(0, List.from(_results));
        if (_history.length > 20) _history.removeLast();
        _isRolling = false;
      });
      return;
    }

    final rng = Random();
    setState(() {
      _results = List.filled(_diceCount, 0); // 0 means not rolled yet
      _history.insert(0, []);
      if (_history.length > 20) _history.removeLast();
    });

    for (int i = 0; i < _diceCount; i++) {
       int ticks = 0;
       await Future.doWhile(() async {
         await Future.delayed(const Duration(milliseconds: 50));
         ticks++;
         if (mounted) {
           setState(() {
             _results[i] = rng.nextInt(_diceType) + 1;
           });
         }
         return ticks < 6 && _isRolling;
       });

       if (!mounted || !_isRolling) break;

       setState(() {
         final finalVal = rng.nextInt(_diceType) + 1;
         _results[i] = finalVal;
         _history[0] = _results.sublist(0, i + 1);
       });
       await Future.delayed(const Duration(milliseconds: 100)); // gap between throws
    }
    
    if (mounted) {
      setState(() => _isRolling = false);
    }
  }

  // Sum only counts finalized dice (>0)
  int get _sum => _results.fold(0, (a, b) => a + max(0, b));

  Widget _buildDiceShape(int value, Color color) {
    return SizedBox(
      width: 72, height: 72,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: const Size(72, 72),
            painter: _DicePainter(_diceType, color),
          ),
          Padding(
            padding: EdgeInsets.only(top: _diceType == 4 ? 12.0 : 0.0), // push d4 text down a bit
            child: Text(
              value == 0 ? '?' : '$value',
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dice Roller', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Dice type selector
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Dice Type', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _diceTypes.map((d) => ChoiceChip(
                        label: Text('d$d', style: const TextStyle(fontWeight: FontWeight.bold)),
                        selected: _diceType == d,
                        selectedColor: cs.primary,
                        labelStyle: TextStyle(color: _diceType == d ? cs.onPrimary : null),
                        onSelected: (_) => setState(() => _diceType = d),
                      )).toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Dice count
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Text('Number of dice', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary)),
                    const Spacer(),
                    IconButton(
                      onPressed: _diceCount > 1 ? () => setState(() { _diceCount--; _results = List.filled(_diceCount, 1); }) : null,
                      icon: const Icon(Icons.remove_circle_outline),
                    ),
                    Text('$_diceCount', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    IconButton(
                      onPressed: _diceCount < 6 ? () => setState(() { _diceCount++; _results = List.filled(_diceCount, 1); }) : null,
                      icon: const Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Animation toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Checkbox(
                  value: _skipAnimation,
                  onChanged: _isRolling ? null : (v) => setState(() => _skipAnimation = v ?? false),
                ),
                const Text('Skip animation', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 24),

            // Results display
            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: _results.map((r) => _buildDiceShape(r, cs.primary)).toList(),
            ),

            if (_diceCount > 1 && _sum > 0) ...[
              const SizedBox(height: 12),
              Text('Sum: $_sum', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: cs.primary)),
            ],

            const SizedBox(height: 24),

            // Roll button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: _isRolling ? null : _roll,
                icon: Icon(_isRolling ? LucideIcons.loader2 : LucideIcons.dice5),
                label: Text(_isRolling ? 'Rolling...' : 'Roll ${_diceCount}d$_diceType', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: cs.primary,
                  foregroundColor: cs.onPrimary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Roll History
            if (_history.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(LucideIcons.history, size: 16, color: cs.primary),
                          const SizedBox(width: 8),
                          Text('Roll History', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary)),
                          const Spacer(),
                          GestureDetector(
                            onTap: () => setState(() => _history.clear()),
                            child: Text('Clear', style: TextStyle(fontSize: 12, color: cs.error)),
                          ),
                        ],
                      ),
                      const Divider(),
                      ..._history.asMap().entries.map((e) {
                        final roll = e.value;
                        if (roll.isEmpty) return const SizedBox.shrink(); // empty initial state
                        final sum = roll.fold<int>(0, (a, b) => a + b);
                        final isPartial = roll.length < _diceCount && _isRolling && e.key == 0 && !_skipAnimation;
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Text('#${_history.length - e.key}', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 12)),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  roll.join(' + ') + (isPartial ? ' + ...' : ''),
                                  style: TextStyle(fontWeight: FontWeight.bold, color: isPartial ? cs.primary.withOpacity(0.5) : cs.onSurface),
                                ),
                              ),
                              if (!isPartial || roll.length > 1)
                                Text('= $sum${isPartial ? '...' : ''}', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary)),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _DicePainter extends CustomPainter {
  final int sides;
  final Color color;
  _DicePainter(this.sides, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final shadowPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    final path = Path();
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2.2;

    switch (sides) {
      case 4: // Triangle
        path.moveTo(center.dx, center.dy - radius);
        path.lineTo(center.dx + radius * 1.1, center.dy + radius * 0.8);
        path.lineTo(center.dx - radius * 1.1, center.dy + radius * 0.8);
        path.close();
        break;
      case 6: // Rounded Square
        final rect = Rect.fromCenter(center: center, width: radius * 1.8, height: radius * 1.8);
        path.addRRect(RRect.fromRectAndRadius(rect, const Radius.circular(12)));
        break;
      case 8: // Diamond
        path.moveTo(center.dx, center.dy - radius);
        path.lineTo(center.dx + radius, center.dy);
        path.lineTo(center.dx, center.dy + radius);
        path.lineTo(center.dx - radius, center.dy);
        path.close();
        break;
      case 10: // Kite / Pentagon-ish
        path.moveTo(center.dx, center.dy - radius);
        path.lineTo(center.dx + radius, center.dy - radius * 0.2);
        path.lineTo(center.dx + radius * 0.6, center.dy + radius);
        path.lineTo(center.dx - radius * 0.6, center.dy + radius);
        path.lineTo(center.dx - radius, center.dy - radius * 0.2);
        path.close();
        break;
      case 12: // Hexagon
        for (int i = 0; i < 6; i++) {
          final angle = (pi * 2 / 6) * i - pi / 2;
          final point = Offset(center.dx + radius * cos(angle), center.dy + radius * sin(angle));
          if (i == 0) path.moveTo(point.dx, point.dy);
          else path.lineTo(point.dx, point.dy);
        }
        path.close();
        break;
      case 20: // Decagon or Circle representation
        for (int i = 0; i < 10; i++) {
          final angle = (pi * 2 / 10) * i - pi / 2;
          final point = Offset(center.dx + radius * cos(angle), center.dy + radius * sin(angle));
          if (i == 0) path.moveTo(point.dx, point.dy);
          else path.lineTo(point.dx, point.dy);
        }
        path.close();
        break;
    }
    
    // Draw shadow then shape
    canvas.drawPath(path, shadowPaint);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _DicePainter oldDelegate) => oldDelegate.sides != sides || oldDelegate.color != color;
}

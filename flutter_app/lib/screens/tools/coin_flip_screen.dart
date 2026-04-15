import 'package:flutter/material.dart';
import 'dart:math';

class CoinFlipScreen extends StatefulWidget {
  const CoinFlipScreen({super.key});

  @override
  State<CoinFlipScreen> createState() => _CoinFlipScreenState();
}

class _CoinFlipScreenState extends State<CoinFlipScreen> with SingleTickerProviderStateMixin {
  late AnimationController _flipController;
  late Animation<double> _flipAnimation;
  String _result = '?';
  bool _isFlipping = false;
  int _headsCount = 0;
  int _tailsCount = 0;
  final List<String> _history = [];

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _flipAnimation = Tween<double>(begin: 0, end: 6).animate(
      CurvedAnimation(parent: _flipController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _flipController.dispose();
    super.dispose();
  }

  void _flip() {
    if (_isFlipping) return;
    setState(() => _isFlipping = true);

    final newResult = Random().nextBool() ? 'Heads' : 'Tails';

    _flipController.forward(from: 0).then((_) {
      setState(() {
        _result = newResult;
        _isFlipping = false;
        if (newResult == 'Heads') {
          _headsCount++;
        } else {
          _tailsCount++;
        }
        _history.insert(0, newResult);
        if (_history.length > 20) _history.removeLast();
      });
    });

    // Update result mid-animation for visual effect
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) setState(() => _result = newResult);
    });
  }

  int get _totalFlips => _headsCount + _tailsCount;
  double get _headsPercent => _totalFlips == 0 ? 50 : (_headsCount / _totalFlips * 100);

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isHeads = _result == 'Heads';
    final coinColor = _result == '?' ? Colors.grey : (isHeads ? const Color(0xFFF59E0B) : cs.secondary);

    return Scaffold(
      appBar: AppBar(title: const Text('Coin Flip', style: TextStyle(fontWeight: FontWeight.bold))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const SizedBox(height: 32),

            // Coin display with 3D flip
            GestureDetector(
              onTap: _flip,
              child: AnimatedBuilder(
                animation: _flipAnimation,
                builder: (context, child) {
                  final angle = _flipAnimation.value * pi;
                  return Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.001) // perspective
                      ..rotateX(angle),
                    child: Container(
                      width: 160,
                      height: 160,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: coinColor,
                        boxShadow: [
                          BoxShadow(color: coinColor.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 8)),
                        ],
                        border: Border.all(color: coinColor.withOpacity(0.6), width: 4),
                        gradient: RadialGradient(
                          colors: [coinColor.withOpacity(0.9), coinColor],
                          center: const Alignment(-0.3, -0.3),
                        ),
                      ),
                      child: Text(
                        _result == '?' ? '?' : (isHeads ? 'H' : 'T'),
                        style: const TextStyle(fontSize: 56, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 16),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: Text(
                _isFlipping ? 'Flipping...' : (_result == '?' ? 'Tap the coin' : _result),
                key: ValueKey(_isFlipping ? 'flipping' : _result),
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: _isFlipping ? cs.onSurface.withOpacity(0.5) : cs.onSurface,
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Flip button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: _isFlipping ? null : _flip,
                icon: const Icon(Icons.flip),
                label: Text(_isFlipping ? 'Flipping...' : 'Flip Coin', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF59E0B),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Statistics
            if (_totalFlips > 0)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Statistics', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              children: [
                                Text('$_headsCount', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B))),
                                const Text('Heads', style: TextStyle(fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                          Container(width: 1, height: 40, color: cs.onSurface.withOpacity(0.1)),
                          Expanded(
                            child: Column(
                              children: [
                                Text('$_tailsCount', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: cs.secondary)),
                                const Text('Tails', style: TextStyle(fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Progress bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: _headsPercent / 100,
                          minHeight: 12,
                          backgroundColor: cs.secondary.withOpacity(0.3),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${_headsPercent.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B))),
                          Text('${(100 - _headsPercent).toStringAsFixed(1)}%', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: cs.secondary)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: TextButton(
                          onPressed: () => setState(() { _headsCount = 0; _tailsCount = 0; _history.clear(); _result = '?'; }),
                          child: Text('Reset Stats', style: TextStyle(color: cs.error, fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 16),

            // History dots
            if (_history.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Flip History', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 13)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: _history.map((r) => Container(
                          width: 28, height: 28,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: r == 'Heads' ? const Color(0xFFF59E0B) : cs.secondary,
                          ),
                          child: Text(r == 'Heads' ? 'H' : 'T', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        )).toList(),
                      ),
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

/// Workaround: AnimatedBuilder is just AnimatedWidget with builder pattern.
class AnimatedBuilder extends AnimatedWidget {
  final Widget Function(BuildContext, Widget?) builder;

  const AnimatedBuilder({
    super.key,
    required Animation<double> animation,
    required this.builder,
  }) : super(listenable: animation);

  @override
  Widget build(BuildContext context) {
    return builder(context, null);
  }
}

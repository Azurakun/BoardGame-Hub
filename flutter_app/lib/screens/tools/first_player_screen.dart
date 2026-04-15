import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:math';

class FirstPlayerScreen extends StatefulWidget {
  const FirstPlayerScreen({super.key});

  @override
  State<FirstPlayerScreen> createState() => _FirstPlayerScreenState();
}

class _FirstPlayerScreenState extends State<FirstPlayerScreen> with SingleTickerProviderStateMixin {
  final List<String> _names = ['Player 1', 'Player 2'];
  String? _winner;
  bool _isPicking = false;
  int _highlightIndex = 0;
  List<String>? _shuffledOrder;
  late AnimationController _bounceController;

  // Mode
  String _mode = 'random'; // 'random', 'shuffle', 'elimination'
  final List<String> _eliminationPicked = [];

  static const _colors = [
    Color(0xFF6366F1), Color(0xFFEF4444), Color(0xFF10B981), Color(0xFFF59E0B),
    Color(0xFF06B6D4), Color(0xFFEC4899), Color(0xFF8B5CF6), Color(0xFFF97316),
    Color(0xFF14B8A6), Color(0xFF84CC16),
  ];

  @override
  void initState() {
    super.initState();
    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  void _addPlayer() {
    if (_names.length >= 10) return;
    setState(() => _names.add('Player ${_names.length + 1}'));
  }

  void _removePlayer(int index) {
    if (_names.length <= 2) return;
    setState(() => _names.removeAt(index));
  }

  void _editName(int index) async {
    final controller = TextEditingController(text: _names[index]);
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Name'),
        content: TextField(controller: controller, autofocus: true),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, controller.text), child: const Text('OK')),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      setState(() => _names[index] = result);
    }
  }

  void _pick() {
    if (_isPicking || _names.isEmpty) return;

    switch (_mode) {
      case 'random':
        _runRandomPick();
        break;
      case 'shuffle':
        _runShuffle();
        break;
      case 'elimination':
        _runElimination();
        break;
    }
  }

  void _runRandomPick() {
    setState(() {
      _isPicking = true;
      _winner = null;
      _shuffledOrder = null;
    });

    int ticks = 0;
    final rng = Random();
    final totalTicks = 15 + rng.nextInt(10);

    Future.doWhile(() async {
      await Future.delayed(Duration(milliseconds: 50 + ticks * 20)); // slow down
      ticks++;
      setState(() => _highlightIndex = rng.nextInt(_names.length));
      return ticks < totalTicks;
    }).then((_) {
      _bounceController.forward(from: 0);
      setState(() {
        _winner = _names[_highlightIndex];
        _isPicking = false;
      });
    });
  }

  void _runShuffle() {
    setState(() {
      _isPicking = true;
      _winner = null;
    });

    Future.delayed(const Duration(milliseconds: 600), () {
      final shuffled = List<String>.from(_names)..shuffle();
      _bounceController.forward(from: 0);
      setState(() {
        _shuffledOrder = shuffled;
        _isPicking = false;
      });
    });
  }

  void _runElimination() {
    final remaining = _names.where((n) => !_eliminationPicked.contains(n)).toList();
    if (remaining.isEmpty) {
      setState(() => _eliminationPicked.clear());
      return;
    }

    setState(() {
      _isPicking = true;
      _winner = null;
    });

    int ticks = 0;
    final rng = Random();
    Future.doWhile(() async {
      await Future.delayed(Duration(milliseconds: 50 + ticks * 25));
      ticks++;
      setState(() => _highlightIndex = _names.indexOf(remaining[rng.nextInt(remaining.length)]));
      return ticks < 12;
    }).then((_) {
      final picked = remaining[Random().nextInt(remaining.length)];
      _bounceController.forward(from: 0);
      setState(() {
        _winner = picked;
        _eliminationPicked.add(picked);
        _isPicking = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('First Player', style: TextStyle(fontWeight: FontWeight.bold))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Mode selector
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Mode', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 13)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        ChoiceChip(label: const Text('Random Pick'), selected: _mode == 'random', onSelected: (_) => setState(() { _mode = 'random'; _winner = null; _shuffledOrder = null; })),
                        ChoiceChip(label: const Text('Shuffle Order'), selected: _mode == 'shuffle', onSelected: (_) => setState(() { _mode = 'shuffle'; _winner = null; _shuffledOrder = null; })),
                        ChoiceChip(label: const Text('Elimination'), selected: _mode == 'elimination', onSelected: (_) => setState(() { _mode = 'elimination'; _winner = null; _eliminationPicked.clear(); })),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Player names
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('Players', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 13)),
                        const Spacer(),
                        if (_names.length < 10)
                          TextButton.icon(
                            onPressed: _addPlayer,
                            icon: const Icon(LucideIcons.userPlus, size: 14),
                            label: const Text('Add', style: TextStyle(fontSize: 12)),
                          ),
                      ],
                    ),
                    ..._names.asMap().entries.map((e) {
                      final idx = e.key;
                      final name = e.value;
                      final isHighlit = _isPicking && _highlightIndex == idx;
                      final isElimPicked = _mode == 'elimination' && _eliminationPicked.contains(name);
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        margin: const EdgeInsets.only(bottom: 4),
                        decoration: BoxDecoration(
                          color: isHighlit ? _colors[idx % _colors.length].withOpacity(0.2) : null,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ListTile(
                          dense: true,
                          leading: Container(
                            width: 32, height: 32,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: _colors[idx % _colors.length].withOpacity(isElimPicked ? 0.3 : 1),
                              shape: BoxShape.circle,
                            ),
                            child: Text('${idx + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                          ),
                          title: Text(name, style: TextStyle(
                            fontWeight: FontWeight.bold,
                            decoration: isElimPicked ? TextDecoration.lineThrough : null,
                            color: isElimPicked ? Colors.grey : null,
                          )),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(icon: const Icon(LucideIcons.pencil, size: 14), onPressed: () => _editName(idx)),
                              if (_names.length > 2)
                                IconButton(icon: Icon(LucideIcons.x, size: 14, color: cs.error), onPressed: () => _removePlayer(idx)),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Single player easter egg
            if (_names.length == 1)
              Card(
                color: cs.primary.withOpacity(0.1),
                child: const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Congratulations, you go first! And second. And every turn after that. 🎉',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            else ...[
              // Go button
              SizedBox(
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _isPicking ? null : _pick,
                  icon: Icon(_isPicking ? LucideIcons.loader2 : LucideIcons.sparkles),
                  label: Text(
                    _isPicking ? 'Picking...' : (_mode == 'shuffle' ? 'Shuffle!' : 'Pick!'),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: cs.primary,
                    foregroundColor: cs.onPrimary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 20),

            // Result
            if (_winner != null && _mode != 'shuffle')
              ScaleTransition(
                scale: CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
                child: Card(
                  color: cs.primary.withOpacity(0.1),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Icon(LucideIcons.partyPopper, size: 40, color: cs.primary),
                        const SizedBox(height: 12),
                        Text(
                          _mode == 'elimination' ? '#${_eliminationPicked.length}' : 'Goes First!',
                          style: TextStyle(fontSize: 14, color: cs.primary, fontWeight: FontWeight.bold),
                        ),
                        Text(_winner!, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: cs.primary)),
                      ],
                    ),
                  ),
                ),
              ),

            // Shuffle result
            if (_shuffledOrder != null)
              ScaleTransition(
                scale: CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Turn Order', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary)),
                        const SizedBox(height: 8),
                        ..._shuffledOrder!.asMap().entries.map((e) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Container(
                                width: 28, height: 28,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(color: _colors[e.key % _colors.length], shape: BoxShape.circle),
                                child: Text('${e.key + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                              const SizedBox(width: 12),
                              Text(e.value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: e.key == 0 ? cs.primary : null)),
                              if (e.key == 0) ...[const SizedBox(width: 8), Icon(LucideIcons.crown, size: 14, color: cs.primary)],
                            ],
                          ),
                        )),
                      ],
                    ),
                  ),
                ),
              ),

            // Elimination progress
            if (_mode == 'elimination' && _eliminationPicked.isNotEmpty)
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
                            Text('Pick Order', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 13)),
                            const Spacer(),
                            TextButton(
                              onPressed: () => setState(() { _eliminationPicked.clear(); _winner = null; }),
                              child: Text('Reset', style: TextStyle(color: cs.error, fontSize: 12)),
                            ),
                          ],
                        ),
                        ..._eliminationPicked.asMap().entries.map((e) => Text(
                          '${e.key + 1}. ${e.value}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        )),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

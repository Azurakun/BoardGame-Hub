import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class ScoreCounterScreen extends StatefulWidget {
  const ScoreCounterScreen({super.key});

  @override
  State<ScoreCounterScreen> createState() => _ScoreCounterScreenState();
}

class _PlayerScore {
  String name;
  int score;
  Color color;
  _PlayerScore({required this.name, this.score = 0, required this.color});
}

class _ScoreAction {
  final int playerIndex;
  final int delta;
  _ScoreAction(this.playerIndex, this.delta);
}

class _ScoreCounterScreenState extends State<ScoreCounterScreen> {
  final List<_PlayerScore> _players = [
    _PlayerScore(name: 'Player 1', color: const Color(0xFF6366F1)),
    _PlayerScore(name: 'Player 2', color: const Color(0xFFEF4444)),
  ];
  final List<_ScoreAction> _undoStack = [];
  int _step = 1;

  static const _colors = [
    Color(0xFF6366F1), Color(0xFFEF4444), Color(0xFF10B981), Color(0xFFF59E0B),
    Color(0xFF06B6D4), Color(0xFFEC4899), Color(0xFF8B5CF6), Color(0xFFF97316),
  ];

  void _addPlayer() {
    if (_players.length >= 8) return;
    setState(() {
      _players.add(_PlayerScore(
        name: 'Player ${_players.length + 1}',
        color: _colors[_players.length % _colors.length],
      ));
    });
  }

  void _removePlayer(int index) {
    if (_players.length <= 1) return;
    setState(() => _players.removeAt(index));
  }

  void _changeScore(int index, int delta) {
    setState(() {
      _players[index].score += delta;
      _undoStack.add(_ScoreAction(index, delta));
      if (_undoStack.length > 50) _undoStack.removeAt(0);
    });
  }

  void _undo() {
    if (_undoStack.isEmpty) return;
    final action = _undoStack.removeLast();
    setState(() {
      if (action.playerIndex < _players.length) {
        _players[action.playerIndex].score -= action.delta;
      }
    });
  }

  int get _maxScore => _players.isEmpty ? 0 : _players.map((p) => p.score).reduce((a, b) => a > b ? a : b);

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Score Counter', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          if (_undoStack.isNotEmpty)
            IconButton(icon: const Icon(LucideIcons.undo2), onPressed: _undo, tooltip: 'Undo'),
          IconButton(icon: const Icon(LucideIcons.rotateCcw), onPressed: () => setState(() {
            for (var p in _players) { p.score = 0; }
            _undoStack.clear();
          }), tooltip: 'Reset All'),
        ],
      ),
      body: Column(
        children: [
          // Step size selector
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text('Step: ', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary)),
                ...[1, 5, 10].map((s) => Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text('±$s', style: const TextStyle(fontWeight: FontWeight.bold)),
                    selected: _step == s,
                    selectedColor: cs.primary,
                    labelStyle: TextStyle(color: _step == s ? cs.onPrimary : null),
                    onSelected: (_) => setState(() => _step = s),
                  ),
                )),
                const Spacer(),
                if (_players.length < 8)
                  TextButton.icon(
                    onPressed: _addPlayer,
                    icon: const Icon(LucideIcons.userPlus, size: 16),
                    label: const Text('Add', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),

          // Player list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _players.length,
              itemBuilder: (context, index) {
                final p = _players[index];
                final isLeader = p.score == _maxScore && _maxScore > 0;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: isLeader ? 6 : 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: isLeader ? BorderSide(color: p.color, width: 2) : BorderSide.none,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        // Color + crown
                        Column(
                          children: [
                            if (isLeader) Icon(LucideIcons.crown, size: 16, color: p.color),
                            Container(
                              width: 40, height: 40,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(color: p.color.withOpacity(0.15), shape: BoxShape.circle),
                              child: Text('${index + 1}', style: TextStyle(fontWeight: FontWeight.bold, color: p.color)),
                            ),
                          ],
                        ),
                        const SizedBox(width: 12),

                        // Name (editable)
                        Expanded(
                          child: GestureDetector(
                            onTap: () async {
                              final controller = TextEditingController(text: p.name);
                              final newName = await showDialog<String>(
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
                              if (newName != null && newName.isNotEmpty) setState(() => p.name = newName);
                            },
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                    const SizedBox(width: 4),
                                    Icon(LucideIcons.pencil, size: 12, color: cs.onSurface.withOpacity(0.3)),
                                  ],
                                ),
                                Text('${p.score} pts', style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.5))),
                              ],
                            ),
                          ),
                        ),

                        // Score display
                        Text(
                          '${p.score}',
                          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: p.color),
                        ),
                        const SizedBox(width: 12),

                        // Controls
                        Column(
                          children: [
                            IconButton(
                              onPressed: () => _changeScore(index, _step),
                              icon: const Icon(Icons.add_circle, size: 28),
                              color: p.color,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                            ),
                            IconButton(
                              onPressed: () => _changeScore(index, -_step),
                              icon: const Icon(Icons.remove_circle, size: 28),
                              color: cs.onSurface.withOpacity(0.4),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                            ),
                          ],
                        ),

                        // Remove
                        if (_players.length > 1)
                          IconButton(
                            onPressed: () => _removePlayer(index),
                            icon: Icon(LucideIcons.x, size: 16, color: cs.error.withOpacity(0.5)),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

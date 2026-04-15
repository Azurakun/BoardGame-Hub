import 'package:flutter/material.dart';
import 'dart:math';
import 'package:lucide_icons/lucide_icons.dart';

class LifeCounterScreen extends StatefulWidget {
  const LifeCounterScreen({super.key});

  @override
  State<LifeCounterScreen> createState() => _LifeCounterScreenState();
}

class _LifePlayer {
  String name;
  int life;
  int mana;
  Color color;
  _LifePlayer({required this.name, required this.life, this.mana = 0, required this.color});
}

class _LifeCounterScreenState extends State<LifeCounterScreen> {
  int _playerCount = 2;
  int _startingLife = 20;
  bool _useMana = false;
  bool _isSetup = true;
  List<_LifePlayer> _players = [];

  static const _presets = {
    'MTG (20)': 20,
    'Commander (40)': 40,
    'Yu-Gi-Oh (8000)': 8000,
    'Pokémon (6)': 6,
    'Custom': -1,
  };
  String _selectedPreset = 'MTG (20)';
  int _customLife = 20;

  static const _colors = [
    Color(0xFF6366F1), Color(0xFFEF4444), Color(0xFF10B981), Color(0xFFF59E0B),
  ];

  void _startGame() {
    final life = _selectedPreset == 'Custom' ? _customLife : _startingLife;
    setState(() {
      _players = List.generate(_playerCount, (i) => _LifePlayer(
        name: 'Player ${i + 1}',
        life: life,
        mana: 0,
        color: _colors[i % _colors.length],
      ));
      _isSetup = false;
    });
  }

  void _changeLife(int index, int delta) {
    setState(() => _players[index].life += delta);
  }

  void _changeMana(int index, int delta) {
    setState(() => _players[index].mana = max(0, _players[index].mana + delta));
  }

  @override
  Widget build(BuildContext context) {
    if (_isSetup) return _buildSetup(context);
    return _buildGameplay(context);
  }

  Widget _buildSetup(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Life Counter', style: TextStyle(fontWeight: FontWeight.bold))),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Players', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 16)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: _playerCount > 1 ? () => setState(() => _playerCount--) : null,
                  icon: const Icon(Icons.remove_circle_outline, size: 32),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  decoration: BoxDecoration(color: cs.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: Text('$_playerCount', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: cs.primary)),
                ),
                IconButton(
                  onPressed: _playerCount < 4 ? () => setState(() => _playerCount++) : null,
                  icon: const Icon(Icons.add_circle_outline, size: 32),
                ),
              ],
            ),
            const SizedBox(height: 32),

            Text('Starting Life', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 16)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _presets.entries.map((e) => ChoiceChip(
                label: Text(e.key, style: const TextStyle(fontWeight: FontWeight.bold)),
                selected: _selectedPreset == e.key,
                selectedColor: cs.primary,
                labelStyle: TextStyle(color: _selectedPreset == e.key ? cs.onPrimary : null),
                onSelected: (_) => setState(() {
                  _selectedPreset = e.key;
                  if (e.value > 0) _startingLife = e.value;
                  // Auto toggle mana if MTG
                  if (e.key == 'MTG (20)' || e.key == 'Commander (40)') {
                    _useMana = true;
                  } else {
                    _useMana = false;
                  }
                }),
              )).toList(),
            ),

            if (_selectedPreset == 'Custom') ...[
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(onPressed: _customLife > 1 ? () => setState(() => _customLife -= 5) : null, icon: const Icon(Icons.remove_circle_outline)),
                  Text('$_customLife', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: cs.primary)),
                  IconButton(onPressed: _customLife < 99999 ? () => setState(() => _customLife += 5) : null, icon: const Icon(Icons.add_circle_outline)),
                ],
              ),
            ],
            const SizedBox(height: 24),

            SwitchListTile(
              title: const Text('Track Mana / Lands', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Adds a separate counter to each player zone'),
              value: _useMana,
              onChanged: (v) => setState(() => _useMana = v),
              contentPadding: EdgeInsets.zero,
            ),

            const Spacer(),

            ElevatedButton(
              onPressed: _startGame,
              style: ElevatedButton.styleFrom(
                backgroundColor: cs.primary,
                foregroundColor: cs.onPrimary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Start', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGameplay(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.arrowLeft),
                    onPressed: () => setState(() => _isSetup = true),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(LucideIcons.rotateCcw),
                    onPressed: () {
                      final life = _selectedPreset == 'Custom' ? _customLife : _startingLife;
                      setState(() {
                        for (var p in _players) { 
                          p.life = life; 
                          p.mana = 0;
                        }
                      });
                    },
                    tooltip: 'Reset All',
                  ),
                ],
              ),
            ),

            // Player zones
            Expanded(
              child: _buildPlayerZonesLayout(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlayerZonesLayout() {
    if (_playerCount == 1) {
      return _buildPlayerZone(0, 0);
    } else if (_playerCount == 2) {
      return Column(
        children: [
          Expanded(child: _buildPlayerZone(1, 2)), // top player rotated 180
          Expanded(child: _buildPlayerZone(0, 0)), // bottom player
        ],
      );
    } else if (_playerCount == 3) {
      return Column(
        children: [
          Expanded(
            child: Row(
              children: [
                Expanded(child: _buildPlayerZone(1, 2)), // top left, rotated 180
                Expanded(child: _buildPlayerZone(2, 2)), // top right, rotated 180
              ],
            ),
          ),
          Expanded(child: _buildPlayerZone(0, 0)), // bottom
        ],
      );
    } else {
      // 4 players
      return Column(
        children: [
          Expanded(child: _buildPlayerZone(2, 2)), // top player rotated 180
          Expanded(
            flex: 1,
            child: Row(
              children: [
                Expanded(child: _buildPlayerZone(1, 1)), // left player rotated 90
                Expanded(child: _buildPlayerZone(3, 3)), // right player rotated 270
              ],
            ),
          ),
          Expanded(child: _buildPlayerZone(0, 0)), // bottom player rotated 0
        ],
      );
    }
  }

  Widget _buildPlayerZone(int index, [int rotation = 0]) {
    final p = _players[index];
    final isEliminated = p.life <= 0;
    final fontSize = p.life.abs() >= 1000 ? 36.0 : (p.life.abs() >= 100 ? 48.0 : 64.0);

    return RotatedBox(
      quarterTurns: rotation,
      child: AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isEliminated
            ? Colors.red.withOpacity(0.1)
            : p.color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: p.color.withOpacity(0.3), width: 2),
      ),
      child: Column(
        children: [
          // Top half: + Life Button
          Expanded(
            flex: 5,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                onTap: () => _changeLife(index, 1),
                onLongPress: () => _changeLife(index, 5),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.chevronUp, color: p.color.withOpacity(0.5), size: 36),
                      const SizedBox(height: 8),
                      Text(p.name, style: TextStyle(fontWeight: FontWeight.bold, color: p.color, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ),
          ),
          
          // Center Line: Life display
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            alignment: Alignment.center,
            child: Stack(
              alignment: Alignment.center,
              children: [
                 Text(
                  '${p.life}',
                  style: TextStyle(fontSize: fontSize, fontWeight: FontWeight.bold, color: isEliminated ? Colors.red : p.color, height: 1),
                ),
                if (isEliminated)
                  const Text('ELIMINATED', style: TextStyle(color: Colors.red, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 2)),
              ],
            ),
          ),
          
          // Bottom half: - Life Button
          Expanded(
            flex: _useMana ? 4 : 5,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(_useMana ? 0 : 18)),
                onTap: () => _changeLife(index, -1),
                onLongPress: () => _changeLife(index, -5),
                child: Center(
                  child: Icon(LucideIcons.chevronDown, color: p.color.withOpacity(0.5), size: 36),
                ),
              ),
            ),
          ),
          
          // Mana row
          if (_useMana)
            Container(
              height: 48,
              decoration: BoxDecoration(
                color: p.color.withOpacity(0.1),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(18)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(icon: const Icon(LucideIcons.minusCircle, size: 20), onPressed: () => _changeMana(index, -1), color: p.color),
                  const SizedBox(width: 8),
                  Icon(LucideIcons.droplets, size: 16, color: p.color.withOpacity(0.6)),
                  const SizedBox(width: 4),
                  Text('${p.mana}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: p.color)),
                  const SizedBox(width: 12),
                  IconButton(icon: const Icon(LucideIcons.plusCircle, size: 20), onPressed: () => _changeMana(index, 1), color: p.color),
                ],
              ),
            ),
        ],
      ),
    ),
    );
  }
}

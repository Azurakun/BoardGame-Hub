import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:async';

class TurnTimerScreen extends StatefulWidget {
  const TurnTimerScreen({super.key});

  @override
  State<TurnTimerScreen> createState() => _TurnTimerScreenState();
}

class _TimerPlayer {
  String name;
  int totalSeconds;
  int remainingSeconds;
  bool isEliminated;
  Color color;

  _TimerPlayer({required this.name, required this.totalSeconds, required this.color})
      : remainingSeconds = totalSeconds,
        isEliminated = false;

  String get displayTime {
    final isNegative = remainingSeconds < 0;
    final abs = remainingSeconds.abs();
    final m = (abs ~/ 60).toString().padLeft(2, '0');
    final s = (abs % 60).toString().padLeft(2, '0');
    return '${isNegative ? '-' : ''}$m:$s';
  }
}

class _TurnTimerScreenState extends State<TurnTimerScreen> with WidgetsBindingObserver {
  List<_TimerPlayer> _players = [];
  int _activeIndex = 0;
  bool _isRunning = false;
  bool _isSetup = true;
  Timer? _timer;

  // Setup state
  int _playerCount = 2;
  int _presetSeconds = 300; // 5 min default

  static const _presets = {
    'Blitz (3m)': 180,
    'Rapid (5m)': 300,
    'Standard (10m)': 600,
    'Long (15m)': 900,
    'Custom': -1,
  };
  String _selectedPreset = 'Rapid (5m)';
  int _customMinutes = 5;

  static const _colors = [
    Color(0xFF6366F1), Color(0xFFEF4444), Color(0xFF10B981), Color(0xFFF59E0B),
    Color(0xFF06B6D4), Color(0xFFEC4899), Color(0xFF8B5CF6), Color(0xFFF97316),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    _timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused && _isRunning) {
      _pause();
    }
  }

  void _startGame() {
    final seconds = _selectedPreset == 'Custom' ? _customMinutes * 60 : _presetSeconds;
    setState(() {
      _players = List.generate(_playerCount, (i) => _TimerPlayer(
        name: 'Player ${i + 1}',
        totalSeconds: seconds,
        color: _colors[i % _colors.length],
      ));
      _activeIndex = 0;
      _isSetup = false;
      _isRunning = false;
    });
  }

  void _tick() {
    if (!_isRunning || _activeIndex >= _players.length) return;
    setState(() {
      final p = _players[_activeIndex];
      p.remainingSeconds--;
      if (p.remainingSeconds <= 0) {
        p.isEliminated = true;
        HapticFeedback.heavyImpact();
        _nextPlayer();
      } else if (p.remainingSeconds <= 10) {
        HapticFeedback.lightImpact();
      }
    });
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
    setState(() => _isRunning = true);
  }

  void _pause() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _nextPlayer() {
    _timer?.cancel();
    // Find next non-eliminated player
    int next = (_activeIndex + 1) % _players.length;
    int checked = 0;
    while (_players[next].isEliminated && checked < _players.length) {
      next = (next + 1) % _players.length;
      checked++;
    }

    final alive = _players.where((p) => !p.isEliminated).toList();
    if (alive.length <= 1) {
      setState(() {
        _isRunning = false;
        _activeIndex = next;
      });
      if (alive.length == 1) _showWinner(alive.first);
      return;
    }

    setState(() => _activeIndex = next);
    _startTimer();
  }

  void _showWinner(_TimerPlayer winner) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(children: [
          Icon(LucideIcons.trophy, color: winner.color),
          const SizedBox(width: 8),
          const Text('Winner!'),
        ]),
        content: Text('${winner.name} wins!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: winner.color)),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK'))],
      ),
    );
  }

  void _resetGame() {
    _timer?.cancel();
    setState(() {
      _isSetup = true;
      _isRunning = false;
      _players = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isSetup) return _buildSetup(context);
    if (_players.length == 2) return _buildTwoPlayerMode(context);
    return _buildMultiPlayerMode(context);
  }

  // ───── Setup Screen ─────
  Widget _buildSetup(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Turn Timer', style: TextStyle(fontWeight: FontWeight.bold))),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Number of Players', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 16)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: _playerCount > 2 ? () => setState(() => _playerCount--) : null,
                  icon: const Icon(Icons.remove_circle_outline, size: 32),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  decoration: BoxDecoration(color: cs.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: Text('$_playerCount', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: cs.primary)),
                ),
                IconButton(
                  onPressed: _playerCount < 8 ? () => setState(() => _playerCount++) : null,
                  icon: const Icon(Icons.add_circle_outline, size: 32),
                ),
              ],
            ),
            const SizedBox(height: 32),

            Text('Time Per Player', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 16)),
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
                  if (e.value > 0) _presetSeconds = e.value;
                }),
              )).toList(),
            ),

            if (_selectedPreset == 'Custom') ...[
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(onPressed: _customMinutes > 1 ? () => setState(() => _customMinutes--) : null, icon: const Icon(Icons.remove_circle_outline)),
                  Text('$_customMinutes min', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: cs.primary)),
                  IconButton(onPressed: _customMinutes < 60 ? () => setState(() => _customMinutes++) : null, icon: const Icon(Icons.add_circle_outline)),
                ],
              ),
            ],

            const Spacer(),

            ElevatedButton(
              onPressed: _startGame,
              style: ElevatedButton.styleFrom(
                backgroundColor: cs.primary,
                foregroundColor: cs.onPrimary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Start Game', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // ───── 2-Player Chess Clock (180° rotated) ─────
  Widget _buildTwoPlayerMode(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Player 2 (top, rotated 180°)
            Expanded(child: _buildClockHalf(1, rotated: true)),
            // Controls bar
            _buildControlBar(),
            // Player 1 (bottom)
            Expanded(child: _buildClockHalf(0, rotated: false)),
          ],
        ),
      ),
    );
  }

  Widget _buildClockHalf(int index, {required bool rotated}) {
    final p = _players[index];
    final isActive = _activeIndex == index && _isRunning;

    return GestureDetector(
      onTap: () {
        if (p.isEliminated) return;
        if (_activeIndex == index) {
          if (!_isRunning) {
            setState(() => _activeIndex = index);
            _startTimer();
          } else {
            _nextPlayer();
          }
        }
      },
      child: RotatedBox(
        quarterTurns: rotated ? 2 : 0,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          decoration: BoxDecoration(
            color: p.isEliminated
                ? Colors.grey.withOpacity(0.2)
                : (isActive ? p.color.withOpacity(0.15) : Colors.transparent),
          ),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(p.name, style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: p.isEliminated ? Colors.grey : p.color,
                )),
                const SizedBox(height: 8),
                Text(
                  p.isEliminated ? "TIME'S UP" : p.displayTime,
                  style: TextStyle(
                    fontSize: 56,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: p.isEliminated ? Colors.grey : (p.remainingSeconds <= 10 ? Colors.red : null),
                  ),
                ),
                if (isActive)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text('TAP TO END TURN', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ───── Multi-player mode (3-8) ─────
  Widget _buildMultiPlayerMode(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Turn Timer', style: TextStyle(fontWeight: FontWeight.bold)),
        leading: IconButton(icon: const Icon(LucideIcons.arrowLeft), onPressed: _resetGame),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _players.length,
              itemBuilder: (context, index) {
                final p = _players[index];
                final isActive = _activeIndex == index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Card(
                    elevation: isActive ? 6 : 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: isActive ? BorderSide(color: p.color, width: 2) : BorderSide.none,
                    ),
                    child: InkWell(
                      onTap: isActive && _isRunning ? _nextPlayer : null,
                      borderRadius: BorderRadius.circular(16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 48,
                              decoration: BoxDecoration(
                                color: p.isEliminated ? Colors.grey : p.color,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p.name, style: TextStyle(fontWeight: FontWeight.bold, color: p.isEliminated ? Colors.grey : null)),
                                  if (p.isEliminated) const Text("TIME'S UP", style: TextStyle(color: Colors.red, fontSize: 11, fontWeight: FontWeight.bold)),
                                  if (isActive && _isRunning) const Text('ACTIVE — Tap to end turn', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                ],
                              ),
                            ),
                            Text(
                              p.displayTime,
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                                color: p.isEliminated ? Colors.grey : (p.remainingSeconds <= 10 ? Colors.red : p.color),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          _buildControlBar(),
        ],
      ),
    );
  }

  Widget _buildControlBar() {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: cs.surface,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          IconButton(
            onPressed: _resetGame,
            icon: const Icon(LucideIcons.rotateCcw),
            tooltip: 'New Game',
          ),
          ElevatedButton.icon(
            onPressed: _isRunning ? _pause : () {
              setState(() => _activeIndex = _activeIndex);
              _startTimer();
            },
            icon: Icon(_isRunning ? LucideIcons.pause : LucideIcons.play),
            label: Text(_isRunning ? 'Pause' : 'Start', style: const TextStyle(fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: _isRunning ? cs.error : cs.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          if (_isRunning)
            IconButton(
              onPressed: _nextPlayer,
              icon: const Icon(LucideIcons.skipForward),
              tooltip: 'Next Player',
            )
          else
            const SizedBox(width: 48),
        ],
      ),
    );
  }
}

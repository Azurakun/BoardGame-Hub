import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:math';
import '../services/api_service.dart';
import '../models/game.dart';
import '../providers/app_state.dart';
import '../widgets/error_retry_widget.dart';
import '../utils/l10n.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<Game>> _gamesFuture;

  @override
  void initState() {
    super.initState();
    _gamesFuture = ApiService.fetchGames();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<AppState>().language;

    return Scaffold(
      backgroundColor: Colors.transparent, 
      appBar: AppBar(
        title: const Text('BoardGame Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: Icon(context.watch<AppState>().isDarkMode ? LucideIcons.sun : LucideIcons.moon),
            onPressed: () => context.read<AppState>().toggleTheme(),
          ),
          TextButton(
            onPressed: () {
              context.read<AppState>().setLanguage(lang == 'en' ? 'id' : 'en');
            },
            child: Text(lang.toUpperCase(), style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: FutureBuilder<List<Game>>(
        future: _gamesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return ErrorRetryWidget.fromSnapshot(
              snapshot,
              message: 'Could not load games',
              onRetry: () => setState(() => _gamesFuture = ApiService.fetchGames()),
            );
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No games found.'));
          }

          final games = snapshot.data!;
          
          return TweenAnimationBuilder(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, 30 * (1 - value)),
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 10),
                        
                        // Greeting and Subtext
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(L10n.t(lang, 'homeGreeting'), style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 16, fontWeight: FontWeight.bold)),
                              Text(L10n.t(lang, 'homeSubtitle'), style: const TextStyle(fontSize: 28, height: 1.2, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 24),

                        // Quick Action Cards
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: Row(
                            children: [
                              _buildQuickAction(context, L10n.t(lang, 'homeQuickActionFind'), LucideIcons.search, () => context.go('/wiki'), Colors.orange),
                              _buildQuickAction(context, L10n.t(lang, 'homeQuickActionRoll'), LucideIcons.dice5, () => context.go('/tools'), Colors.indigoAccent),
                              _buildQuickAction(context, L10n.t(lang, 'homeQuickActionCard'), LucideIcons.layers, () => context.go('/cards'), Colors.teal),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 32),
                        
                        // Dynamic Game of the Day (Challenge based)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0),
                          child: Text(
                            L10n.t(lang, 'homeChallenge'),
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildChallengeOfTheDay(context, games, lang),

                        const SizedBox(height: 32),

                        // Mock News Engine
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0),
                          child: Text(
                            L10n.t(lang, 'homeNewsTitle'),
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildMockNewsSection(context, lang),

                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: L10n.t(lang, 'titleSettings'),
        backgroundColor: Theme.of(context).colorScheme.tertiary,
        foregroundColor: Theme.of(context).colorScheme.onSecondary,
        onPressed: () => context.push('/admin/login'),
        child: const Icon(LucideIcons.shieldCheck),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, String title, IconData icon, VoidCallback onTap, Color accentColor) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface.withOpacity(0.6),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: accentColor.withOpacity(0.3), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: accentColor.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 5),
              )
            ]
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: accentColor.withOpacity(0.1), shape: BoxShape.circle),
                child: Icon(icon, color: accentColor, size: 28),
              ),
              const SizedBox(height: 12),
              Text(title, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChallengeOfTheDay(BuildContext context, List<Game> games, String lang) {
    // Isolate highest complexity games, randomly pick one if multiple exist.
    games.sort((a, b) => b.complexity.compareTo(a.complexity));
    final topGames = games.where((g) => g.complexity == games.first.complexity).toList();
    final challengingGame = topGames[Random().nextInt(topGames.length)];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: GestureDetector(
        onTap: () => context.push('/game/${challengingGame.id}'),
        child: Container(
          height: 220,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            image: DecorationImage(
              image: NetworkImage(ApiService.getImageUrl(challengingGame.imageUrl)),
              fit: BoxFit.cover,
            ),
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                blurRadius: 15,
                offset: const Offset(0, 5),
              )
            ]
          ),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                colors: [Colors.transparent, Colors.black.withOpacity(0.95)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.8), borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.flame, size: 14, color: Colors.white),
                          const SizedBox(width: 4),
                          Text('${L10n.t(lang, 'complexity')} ${challengingGame.complexity}/5', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  challengingGame.name.get(lang),
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  challengingGame.shortDescription.get(lang),
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMockNewsSection(BuildContext context, String lang) {
    // Structured mock news entries
    final newsList = [
      {
        'title': lang == 'id' ? 'Pembaruan Patch 1.2: Sistem Deck Pokemon Tersedia' : 'Patch Update 1.2: Pokemon Deck System Available',
        'date': '2 Hours Ago',
        'icon': LucideIcons.zap,
        'color': Colors.amber,
      },
      {
        'title': lang == 'id' ? 'Spiel des Jahres 2026: Nominasi Diumumkan' : 'Spiel des Jahres 2026: Nominations Announced',
        'date': 'Yesterday',
        'icon': LucideIcons.award,
        'color': Colors.purpleAccent,
      },
      {
        'title': lang == 'id' ? 'Panduan Strategi: Menguasai Game Kompleksitas Tinggi' : 'Strategy Guide: Mastering High Complexity Games',
        'date': '3 Days Ago',
        'icon': LucideIcons.bookOpen,
        'color': Colors.blueAccent,
      }
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        children: newsList.map((news) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface.withOpacity(0.6),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.05)),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (news['color'] as Color).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(news['icon'] as IconData, color: news['color'] as Color),
              ),
              title: Text(news['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(news['date'] as String, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.primary.withOpacity(0.6))),
              ),
              trailing: const Icon(LucideIcons.chevronRight, size: 18),
              onTap: () {
                // Mock onTap
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(L10n.t(lang, 'readMore'))));
              },
            ),
          );
        }).toList(),
      ),
    );
  }
}

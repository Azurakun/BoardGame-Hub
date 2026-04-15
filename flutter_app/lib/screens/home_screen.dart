import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/api_service.dart';
import '../models/game.dart';
import '../providers/app_state.dart';
import '../widgets/error_retry_widget.dart';

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
      backgroundColor: Colors.transparent, // Background handled by AnimatedBackground
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
                      Text('Ready to play?', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 16, fontWeight: FontWeight.bold)),
                      const Text('Discover & Organize\nYour Tabletop Journey', style: TextStyle(fontSize: 28, height: 1.2, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                
                const SizedBox(height: 24),

                // Quick Action Cards
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Row(
                    children: [
                      _buildQuickAction(context, 'Find Game', LucideIcons.search, () => context.go('/wiki'), Colors.orangeAccent),
                      _buildQuickAction(context, 'Roll Dice', LucideIcons.dice5, () => context.go('/tools'), Colors.indigoAccent),
                      _buildQuickAction(context, 'Deck List', LucideIcons.layers, () => context.go('/cards'), Colors.teal),
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Featured Games Title
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24.0),
                  child: Text(
                    'Featured Collections',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 16),

                // Main Carousel
                CarouselSlider(
                  options: CarouselOptions(
                    height: 350.0,
                    enlargeCenterPage: true,
                    viewportFraction: 0.75,
                    autoPlay: true,
                    autoPlayInterval: const Duration(seconds: 4),
                  ),
                  items: games.take(4).map((game) {
                    return Builder(
                      builder: (BuildContext context) {
                        return GestureDetector(
                          onTap: () => context.push('/game/${game.id}'),
                          child: Container(
                            width: MediaQuery.of(context).size.width,
                            margin: const EdgeInsets.symmetric(horizontal: 5.0),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              image: DecorationImage(
                                image: NetworkImage(ApiService.getImageUrl(game.imageUrl)),
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
                                  colors: [Colors.transparent, Colors.black.withOpacity(0.9)],
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
                                      const Icon(LucideIcons.users, size: 14, color: Colors.white70),
                                      const SizedBox(width: 4),
                                      Text('${game.minPlayers}-${game.maxPlayers}', style: const TextStyle(color: Colors.white70, fontSize: 14)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Hero(
                                    tag: 'game_title_${game.id}',
                                    child: Text(
                                      game.name.get(lang),
                                      style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, decoration: TextDecoration.none),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    game.shortDescription.get(lang),
                                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  }).toList(),
                ),

                const SizedBox(height: 30),

                // Popular Categories Strip
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24.0),
                  child: Text(
                    'Browse Categories',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 16),
                
                SizedBox(
                  height: 50,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildCategoryChip(context, 'Strategy'),
                      _buildCategoryChip(context, 'Party'),
                      _buildCategoryChip(context, 'Card Game'),
                      _buildCategoryChip(context, 'Family'),
                      _buildCategoryChip(context, 'Fantasy'),
                    ].map((e) => Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: e)).toList(),
                  ),
                ),
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
        tooltip: 'Admin Settings',
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
  
  Widget _buildCategoryChip(BuildContext context, String title) {
    return ActionChip(
      backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
      side: BorderSide(color: Theme.of(context).colorScheme.primary.withOpacity(0.2)),
      label: Text(title, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold)),
      onPressed: () {
        context.go('/wiki'); // Route specifically if supported
      },
    );
  }
}

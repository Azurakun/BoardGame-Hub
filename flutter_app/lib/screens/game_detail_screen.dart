import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../models/game.dart';
import '../providers/app_state.dart';

class GameDetailScreen extends StatelessWidget {
  final String gameId;
  const GameDetailScreen({super.key, required this.gameId});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<AppState>().language;

    return Scaffold(
      body: FutureBuilder<List<Game>>(
        future: ApiService.fetchGames(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          
          final game = snapshot.data!.firstWhere((g) => g.id == gameId, orElse: () => throw Exception('Game not found'));

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 300.0,
                floating: false,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(game.name.get(lang), style: const TextStyle(shadows: [Shadow(color: Colors.black, blurRadius: 10)])),
                  background: Hero(
                    tag: 'game_img_${game.id}',
                    child: Image.network(
                      ApiService.getImageUrl(game.imageUrl),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.all(16.0),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    Text(game.description.get(lang), style: const TextStyle(fontSize: 16, height: 1.5)),
                    const SizedBox(height: 16),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildChip(context, LucideIcons.users, '${game.minPlayers}-${game.maxPlayers} Players'),
                          _buildChip(context, LucideIcons.clock, '${game.playTime} Min'),
                          _buildChip(context, LucideIcons.brain, 'Complexity: ${game.complexity}/5'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text('How to Play', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(game.howToPlay.get(lang), style: const TextStyle(fontSize: 16, height: 1.5)),
                    if (game.videoUrl != null) ...[
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        icon: const Icon(LucideIcons.playCircle),
                        label: const Text('Watch Tutorial Video'),
                        onPressed: () async {
                          final uri = Uri.parse(game.videoUrl!);
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri);
                          }
                        },
                      )
                    ],
                    const SizedBox(height: 24),
                    const Text('Rules', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    ...game.rules.map((r) => ExpansionTile(
                      title: Text(r.title.get(lang)),
                      children: [Padding(padding: const EdgeInsets.all(16.0), child: Text(r.content.get(lang)))],
                    )),
                    const SizedBox(height: 24),
                    const Text('FAQ', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    ...game.faq.map((f) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        title: Text('Q: ${f.q.get(lang)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text('A: ${f.a.get(lang)}'),
                        ),
                      ),
                    )),
                    const SizedBox(height: 50),
                  ]),
                ),
              )
            ],
          );
        },
      ),
    );
  }

  Widget _buildChip(BuildContext context, IconData icon, String label) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

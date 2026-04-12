import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/api_service.dart';
import '../models/game.dart';
import '../providers/app_state.dart';

class WikiScreen extends StatefulWidget {
  const WikiScreen({super.key});

  @override
  State<WikiScreen> createState() => _WikiScreenState();
}

class _WikiScreenState extends State<WikiScreen> {
  late Future<List<Game>> _gamesFuture;
  String _searchQuery = '';
  String _sortOption = 'Name (A-Z)';
  bool _isGridView = false;

  @override
  void initState() {
    super.initState();
    _gamesFuture = ApiService.fetchGames();
  }

  List<Game> _filterAndSort(List<Game> games, String lang) {
    var filtered = games.where((g) => g.name.get(lang).toLowerCase().contains(_searchQuery)).toList();
    if (_sortOption == 'Name (A-Z)') {
      filtered.sort((a, b) => a.name.get(lang).compareTo(b.name.get(lang)));
    } else if (_sortOption == 'Name (Z-A)') {
      filtered.sort((a, b) => b.name.get(lang).compareTo(a.name.get(lang)));
    } else if (_sortOption == 'Playtime') {
      filtered.sort((a, b) => a.playTime.compareTo(b.playTime));
    }
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<AppState>().language;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Game Library', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: Icon(context.watch<AppState>().isDarkMode ? LucideIcons.sun : LucideIcons.moon),
            onPressed: () => context.read<AppState>().toggleTheme(),
          ),
          TextButton(
            onPressed: () => context.read<AppState>().setLanguage(lang == 'en' ? 'id' : 'en'),
            child: Text(lang.toUpperCase(), style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter & Sort Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            color: Theme.of(context).colorScheme.surface.withOpacity(0.5),
            child: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search games...',
                    prefixIcon: const Icon(LucideIcons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                    filled: true,
                    fillColor: Theme.of(context).colorScheme.surface,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                  onChanged: (value) => setState(() => _searchQuery = value.toLowerCase()),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    DropdownButton<String>(
                      value: _sortOption,
                      dropdownColor: Theme.of(context).colorScheme.surface,
                      underline: const SizedBox(),
                      items: ['Name (A-Z)', 'Name (Z-A)', 'Playtime'].map((s) => DropdownMenuItem(value: s, child: Text(s, style: TextStyle(fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)))).toList(),
                      onChanged: (val) => setState(() => _sortOption = val!),
                    ),
                    IconButton(
                      icon: Icon(_isGridView ? LucideIcons.list : LucideIcons.layoutGrid),
                      onPressed: () => setState(() => _isGridView = !_isGridView),
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ],
                )
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Game>>(
              future: _gamesFuture,
              builder: (context, snapshot) {
                if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}', style: TextStyle(color: Theme.of(context).colorScheme.error)));
                if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                
                final games = _filterAndSort(snapshot.data!, lang);
                
                if (_isGridView) {
                  return GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.75, crossAxisSpacing: 16, mainAxisSpacing: 16),
                    itemCount: games.length,
                    itemBuilder: (context, index) => _buildGridItem(games[index], lang),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: games.length,
                  itemBuilder: (context, index) => _buildListItem(games[index], lang),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListItem(Game game, String lang) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => context.push('/game/${game.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Row(
          children: [
            Hero(
              tag: 'game_img_${game.id}',
              child: ClipRRect(
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
                child: Image.network(ApiService.getImageUrl(game.imageUrl), width: 120, height: 120, fit: BoxFit.cover),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(game.name.get(lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 8),
                    Text('${game.playTime} Min • ${game.minPlayers}-${game.maxPlayers} Players', style: TextStyle(color: Theme.of(context).colorScheme.secondary, fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(game.shortDescription.get(lang), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildGridItem(Game game, String lang) {
    return Card(
      child: InkWell(
        onTap: () => context.push('/game/${game.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Hero(
                tag: 'game_img_${game.id}',
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Image.network(ApiService.getImageUrl(game.imageUrl), fit: BoxFit.cover),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(game.name.get(lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Text('${game.playTime} Min', style: TextStyle(color: Theme.of(context).colorScheme.secondary, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

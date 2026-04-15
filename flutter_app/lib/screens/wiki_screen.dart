import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/api_service.dart';
import '../models/game.dart';
import '../providers/app_state.dart';
import '../widgets/error_retry_widget.dart';
import '../widgets/filter_sort_bar.dart';

class WikiScreen extends StatefulWidget {
  const WikiScreen({super.key});

  @override
  State<WikiScreen> createState() => _WikiScreenState();
}

class _WikiScreenState extends State<WikiScreen> {
  late Future<List<Game>> _gamesFuture;

  // Toolbar state
  String _searchQuery = '';
  String _sortOption = 'Name (A-Z)';
  String _selectedCategory = 'All';
  bool _showSearch = false;
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    _gamesFuture = ApiService.fetchGames();
  }

  List<Game> _filterAndSort(List<Game> games, String lang) {
    var filtered = games.where((g) {
      final q = _searchQuery;
      final nameMatch = g.name.get(lang).toLowerCase().contains(q);
      final descMatch = g.shortDescription.get(lang).toLowerCase().contains(q);
      final catMatch = _selectedCategory == 'All' || g.category.contains(_selectedCategory);
      return (nameMatch || descMatch) && catMatch;
    }).toList();

    switch (_sortOption) {
      case 'Name (A-Z)':
        filtered.sort((a, b) => a.name.get(lang).compareTo(b.name.get(lang)));
        break;
      case 'Name (Z-A)':
        filtered.sort((a, b) => b.name.get(lang).compareTo(a.name.get(lang)));
        break;
      case 'Playtime':
        filtered.sort((a, b) => a.playTime.compareTo(b.playTime));
        break;
      case 'Players':
        filtered.sort((a, b) => a.maxPlayers.compareTo(b.maxPlayers));
        break;
    }
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<AppState>().language;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: FutureBuilder<List<Game>>(
        future: _gamesFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Scaffold(
              appBar: _buildPlainAppBar(context, lang),
              body: ErrorRetryWidget.fromSnapshot(
                snapshot,
                message: 'Could not load game library',
                onRetry: () => setState(() => _gamesFuture = ApiService.fetchGames()),
              ),
            );
          }
          if (!snapshot.hasData) {
            return Scaffold(
              appBar: _buildPlainAppBar(context, lang),
              body: const Center(child: CircularProgressIndicator()),
            );
          }

          final allGames = snapshot.data!;
          // Extract unique categories from all games
          final categories = <String>{};
          for (final g in allGames) {
            categories.addAll(g.category);
          }
          final games = _filterAndSort(allGames, lang);

          final toolbar = FilterSortBar(
            showSearch: _showSearch,
            showFilters: _showFilters,
            searchQuery: _searchQuery,
            sortOption: _sortOption,
            sortOptions: const ['Name (A-Z)', 'Name (Z-A)', 'Playtime', 'Players'],
            searchHint: 'Search games by name or description...',
            resultCount: games.length,
            resultLabel: 'game',
            filterCategories: [
              FilterCategory(
                label: 'Category',
                options: categories,
                selected: _selectedCategory,
                onSelected: (v) => setState(() => _selectedCategory = v),
              ),
            ],
            onToggleSearch: () => setState(() {
              _showSearch = !_showSearch;
              if (!_showSearch) _searchQuery = '';
            }),
            onToggleFilters: () => setState(() => _showFilters = !_showFilters),
            onSearchChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
            onSortChanged: (v) => setState(() => _sortOption = v),
            onClearFilters: () => setState(() {
              _searchQuery = '';
              _selectedCategory = 'All';
            }),
          );

          return Column(
            children: [
              // Standard AppBar with unified toolbar actions + theme/lang toggles
              AppBar(
                title: const Text('Game Library', style: TextStyle(fontWeight: FontWeight.bold)),
                actions: toolbar.buildActions(context),
              ),
              // Standard toolbar body
              toolbar.buildBody(context),
              // Content
              Expanded(
                child: games.isEmpty
                    ? const EmptyFilterResult(message: 'No games match your filters')
                    : context.watch<AppState>().isGridView
                        ? _buildGridView(games, lang)
                        : _buildListView(games, lang),
              ),
            ],
          );
        },
      ),
    );
  }

  AppBar _buildPlainAppBar(BuildContext context, String lang) {
    return AppBar(
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
    );
  }

  // ───── List view ─────
  Widget _buildListView(List<Game> games, String lang) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: games.length,
      itemBuilder: (context, index) => _buildListItem(games[index], lang),
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

  // ───── Grid view ─────
  Widget _buildGridView(List<Game> games, String lang) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.75, crossAxisSpacing: 16, mainAxisSpacing: 16),
      itemCount: games.length,
      itemBuilder: (context, index) => _buildGridItem(games[index], lang),
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

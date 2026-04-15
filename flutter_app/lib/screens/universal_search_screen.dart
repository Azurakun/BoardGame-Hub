import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import '../services/api_service.dart';
import '../models/game.dart';
import '../models/card.dart';
import '../models/tool_definition.dart';
import '../providers/app_state.dart';
import '../widgets/filter_sort_bar.dart';

class SearchResult {
  final String type;
  final String id;
  final String name;
  final String description;
  final String? imageUrl;
  final IconData? icon;
  final Color? color;
  final dynamic originalObject;

  SearchResult({
    required this.type,
    required this.id,
    required this.name,
    required this.description,
    this.imageUrl,
    this.icon,
    this.color,
    required this.originalObject,
  });
}

class UniversalSearchScreen extends StatefulWidget {
  const UniversalSearchScreen({super.key});

  @override
  State<UniversalSearchScreen> createState() => _UniversalSearchScreenState();
}

class _UniversalSearchScreenState extends State<UniversalSearchScreen> {
  late Future<List<SearchResult>> _searchDataFuture;

  // Toolbar state
  String _searchQuery = '';
  String _selectedType = 'All';
  String _sortOption = 'Name (A-Z)';
  bool _showSearch = true; // Open by default
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    _fetchCombinedData();
  }

  void _fetchCombinedData() {
    setState(() {
      _searchDataFuture = Future.wait([
        ApiService.fetchGames(),
        ApiService.fetchCards(),
      ]).then((results) {
        final List<Game> games = results[0] as List<Game>;
        final List<GameCard> cards = results[1] as List<GameCard>;
        final List<ToolDefinition> tools = ToolDefinition.allTools;

        final combined = <SearchResult>[];
        final lang = context.read<AppState>().language;

        combined.addAll(games.map((g) => SearchResult(
          type: 'Game',
          id: g.id,
          name: g.name.get(lang),
          description: g.shortDescription.get(lang),
          imageUrl: ApiService.getImageUrl(g.imageUrl),
          color: Colors.indigoAccent,
          originalObject: g,
        )));

        combined.addAll(cards.map((c) => SearchResult(
          type: 'Card',
          id: c.id,
          name: c.name.get(lang),
          description: c.effect.get(lang),
          imageUrl: ApiService.getImageUrl(c.imageUrl),
          color: Colors.teal,
          originalObject: c,
        )));

        combined.addAll(tools.map((t) => SearchResult(
          type: 'Tool',
          id: t.name.toLowerCase().replaceAll(' ', '-'),
          name: t.name,
          description: t.description,
          icon: t.icon,
          color: t.accentColor,
          originalObject: t,
        )));

        return combined;
      });
    });
  }

  List<SearchResult> _filterAndSort(List<SearchResult> data) {
    if (_searchQuery.isEmpty && _selectedType == 'All') return []; // Empty state before search

    var filtered = data.where((item) {
      final matchQ = item.name.toLowerCase().contains(_searchQuery) ||
                     item.description.toLowerCase().contains(_searchQuery);
      final matchType = _selectedType == 'All' || item.type == _selectedType;
      return matchQ && matchType;
    }).toList();

    if (_sortOption == 'Name (A-Z)') {
      filtered.sort((a, b) => a.name.compareTo(b.name));
    } else if (_sortOption == 'Name (Z-A)') {
      filtered.sort((a, b) => b.name.compareTo(a.name));
    }

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: FutureBuilder<List<SearchResult>>(
        future: _searchDataFuture,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return Scaffold(
              appBar: AppBar(title: const Text('Search', style: TextStyle(fontWeight: FontWeight.bold))),
              body: const Center(child: CircularProgressIndicator()),
            );
          }

          final allData = snapshot.data!;
          final results = _filterAndSort(allData);

          final toolbar = FilterSortBar(
            showSearch: _showSearch,
            showFilters: _showFilters,
            searchQuery: _searchQuery,
            sortOption: _sortOption,
            sortOptions: const ['Name (A-Z)', 'Name (Z-A)'],
            searchHint: 'Search anywhere...',
            resultCount: results.length,
            resultLabel: 'match',
            filterCategories: [
              FilterCategory(
                label: 'Result Type',
                options: const {'Game', 'Card', 'Tool'},
                selected: _selectedType,
                onSelected: (v) => setState(() => _selectedType = v),
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
              _selectedType = 'All';
            }),
          );

          return Column(
            children: [
              AppBar(
                title: const Text('Search', style: TextStyle(fontWeight: FontWeight.bold)),
                actions: toolbar.buildActions(context),
              ),
              toolbar.buildBody(context),
              Expanded(
                child: _searchQuery.isEmpty && _selectedType == 'All'
                    ? const EmptyFilterResult(message: 'Type to discover games, cards, or tools.')
                    : results.isEmpty
                        ? const EmptyFilterResult(message: 'No results found.')
                        : context.watch<AppState>().isGridView
                            ? _buildGridView(results)
                            : _buildListView(results),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildGridView(List<SearchResult> results) {
    return MasonryGridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      padding: const EdgeInsets.all(16),
      itemCount: results.length,
      itemBuilder: (context, index) {
        final item = results[index];
        return _buildResultCard(item);
      },
    );
  }

  Widget _buildListView(List<SearchResult> results) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: results.length,
      separatorBuilder: (c, i) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final item = results[index];
        return _buildResultListTile(item);
      },
    );
  }

  Widget _buildResultCard(SearchResult item) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _handleItemTap(item),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (item.imageUrl != null)
              Container(
                height: 120,
                decoration: BoxDecoration(color: item.color),
                child: Image.network(item.imageUrl!, fit: BoxFit.cover, errorBuilder: (c,e,s) => const Icon(LucideIcons.imageOff)),
              )
            else
              Container(
                height: 100,
                color: item.color?.withOpacity(0.1),
                child: Icon(item.icon ?? LucideIcons.box, size: 48, color: item.color),
              ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: item.color?.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                    child: Text(item.type, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: item.color)),
                  ),
                  const SizedBox(height: 6),
                  Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultListTile(SearchResult item) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () => _handleItemTap(item),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: item.imageUrl != null
                    ? Image.network(item.imageUrl!, width: 60, height: 60, fit: BoxFit.cover, errorBuilder: (c,e,s) => Container(width: 60, height: 60, color: item.color, child: const Icon(LucideIcons.imageOff)))
                    : Container(width: 60, height: 60, color: item.color?.withOpacity(0.1), child: Icon(item.icon ?? LucideIcons.box, color: item.color)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text(item.description, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6))),
                  ],
                ),
              ),
              Container(
                margin: const EdgeInsets.only(left: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: item.color?.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(item.type, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: item.color)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleItemTap(SearchResult item) {
    if (item.type == 'Game') {
      context.push('/game/${item.id}');
    } else if (item.type == 'Card') {
      context.push('/card', extra: item.originalObject);
    } else if (item.type == 'Tool') {
      context.push('/tools/${item.id}');
    }
  }
}

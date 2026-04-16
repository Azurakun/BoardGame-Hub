import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import '../services/api_service.dart';
import '../models/card.dart';
import '../providers/app_state.dart';
import '../widgets/error_retry_widget.dart';
import '../widgets/filter_sort_bar.dart';
import '../utils/l10n.dart';

class CardsScreen extends StatefulWidget {
  const CardsScreen({super.key});

  @override
  State<CardsScreen> createState() => _CardsScreenState();
}

class _CardsScreenState extends State<CardsScreen> {
  late Future<List<GameCard>> _cardsFuture;

  // Toolbar state
  String _searchQuery = '';
  String _selectedType = 'All';
  String _selectedGameId = 'All';
  String _sortOption = 'Name (A-Z)';
  bool _showSearch = false;
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    _cardsFuture = ApiService.fetchCards();
  }

  void _refreshCards() {
    setState(() => _cardsFuture = ApiService.fetchCards());
  }

  List<GameCard> _filterAndSort(List<GameCard> cards, String lang) {
    var filtered = cards.where((c) {
      final q = _searchQuery;
      final nameMatch = c.name.get(lang).toLowerCase().contains(q);
      final effectMatch = c.effect.get(lang).toLowerCase().contains(q);
      final typeMatch = _selectedType == 'All' || c.type.get(lang) == _selectedType;
      final gameMatch = _selectedGameId == 'All' || c.gameId == _selectedGameId;
      return (nameMatch || effectMatch) && typeMatch && gameMatch;
    }).toList();

    switch (_sortOption) {
      case 'Name (A-Z)':
        filtered.sort((a, b) => a.name.get(lang).compareTo(b.name.get(lang)));
        break;
      case 'Name (Z-A)':
        filtered.sort((a, b) => b.name.get(lang).compareTo(a.name.get(lang)));
        break;
      case 'Type':
        filtered.sort((a, b) => a.type.get(lang).compareTo(b.type.get(lang)));
        break;
    }
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<AppState>().language;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: FutureBuilder<List<GameCard>>(
        future: _cardsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Scaffold(
              appBar: AppBar(title: Text(L10n.t(lang, 'titleCards'), style: const TextStyle(fontWeight: FontWeight.bold))),
              body: ErrorRetryWidget.fromSnapshot(snapshot, message: 'Could not load cards', onRetry: _refreshCards),
            );
          }
          if (!snapshot.hasData) {
            return Scaffold(
              appBar: AppBar(title: Text(L10n.t(lang, 'titleCards'), style: const TextStyle(fontWeight: FontWeight.bold))),
              body: const Center(child: CircularProgressIndicator()),
            );
          }

          final allCards = snapshot.data!;
          final types = allCards.map((c) => c.type.get(lang)).toSet();
          final gameIds = allCards.map((c) => c.gameId).toSet();
          final cards = _filterAndSort(allCards, lang);

          final toolbar = FilterSortBar(
            showSearch: _showSearch,
            showFilters: _showFilters,
            searchQuery: _searchQuery,
            sortOption: _sortOption,
            sortOptions: [L10n.t(lang, 'sortNameAZ'), L10n.t(lang, 'sortNameZA'), L10n.t(lang, 'sortType')],
            searchHint: L10n.t(lang, 'searchHintCards'),
            resultCount: cards.length,
            resultLabel: '',
            filterCategories: [
              FilterCategory(
                label: L10n.t(lang, 'sortType'),
                options: types,
                selected: _selectedType,
                onSelected: (v) => setState(() => _selectedType = v),
              ),
              FilterCategory(
                label: 'Game',
                options: gameIds,
                selected: _selectedGameId,
                onSelected: (v) => setState(() => _selectedGameId = v),
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
              _selectedGameId = 'All';
            }),
          );

          return Column(
            children: [
              // Standard AppBar with unified toolbar actions
              AppBar(
                title: Text(L10n.t(lang, 'titleCards'), style: const TextStyle(fontWeight: FontWeight.bold)),
                actions: toolbar.buildActions(context),
              ),
              // Standard toolbar body (search, filters, count)
              toolbar.buildBody(context),
              // Content
              Expanded(
                child: cards.isEmpty
                    ? EmptyFilterResult(message: L10n.t(lang, 'emptyResultCards'))
                    : context.watch<AppState>().isGridView
                        ? _buildGridView(cards, lang)
                        : _buildListView(cards, lang),
              ),
            ],
          );
        },
      ),
    );
  }

  // ───── Grid view (staggered masonry) ─────
  Widget _buildGridView(List<GameCard> cards, String lang) {
    return MasonryGridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      padding: const EdgeInsets.all(16),
      itemCount: cards.length,
      itemBuilder: (context, index) {
        final card = cards[index];
        final cardColor = _parseColor(card.color);
        return Card(
          elevation: 4,
          child: InkWell(
            onTap: () => context.push('/card', extra: card),
            borderRadius: BorderRadius.circular(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (card.imageUrl.isNotEmpty)
                  Hero(
                    tag: 'card_img_${card.id}',
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                      child: Image.network(ApiService.getImageUrl(card.imageUrl), fit: BoxFit.cover),
                    ),
                  ),
                Container(height: 3, color: cardColor),
                Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(card.name.get(lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: cardColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(card.type.get(lang), style: TextStyle(color: cardColor, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: 8),
                      Text(card.effect.get(lang), style: const TextStyle(fontSize: 13), maxLines: 3, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ───── List view (compact rows) ─────
  Widget _buildListView(List<GameCard> cards, String lang) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: cards.length,
      itemBuilder: (context, index) {
        final card = cards[index];
        final cardColor = _parseColor(card.color);
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: InkWell(
            onTap: () => context.push('/card', extra: card),
            borderRadius: BorderRadius.circular(16),
            child: IntrinsicHeight(
              child: Row(
                children: [
                  Container(
                    width: 4,
                    decoration: BoxDecoration(
                      color: cardColor,
                      borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
                    ),
                  ),
                  if (card.imageUrl.isNotEmpty)
                    Hero(
                      tag: 'card_img_${card.id}',
                      child: Image.network(ApiService.getImageUrl(card.imageUrl), width: 80, height: 100, fit: BoxFit.cover),
                    ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(card.name.get(lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: cardColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(card.type.get(lang), style: TextStyle(color: cardColor, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            card.effect.get(lang),
                            style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: Icon(LucideIcons.chevronRight, size: 18, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3)),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Theme.of(context).colorScheme.primary;
    }
  }
}

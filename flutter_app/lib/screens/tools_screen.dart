import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../models/tool_definition.dart';
import '../widgets/filter_sort_bar.dart';

class ToolsScreen extends StatefulWidget {
  const ToolsScreen({super.key});

  @override
  State<ToolsScreen> createState() => _ToolsScreenState();
}

class _ToolsScreenState extends State<ToolsScreen> {
  bool _showSearch = false;
  bool _showFilters = false;
  String _searchQuery = '';
  String _sortOption = 'Default';
  String _selectedCategory = 'All';

  List<ToolDefinition> get _filteredTools {
    var tools = ToolDefinition.allTools.where((t) {
      final nameMatch = t.name.toLowerCase().contains(_searchQuery);
      final catMatch = _selectedCategory == 'All' || t.category == _selectedCategory;
      return nameMatch && catMatch;
    }).toList();

    if (_sortOption == 'Name (A-Z)') {
      tools.sort((a, b) => a.name.compareTo(b.name));
    } else if (_sortOption == 'Name (Z-A)') {
      tools.sort((a, b) => b.name.compareTo(a.name));
    }
    return tools;
  }

  Set<String> get _categories => ToolDefinition.allTools.map((t) => t.category).toSet();

  void _showInfoSheet(ToolDefinition tool) {
    final cs = Theme.of(context).colorScheme;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.85,
        builder: (ctx, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: cs.onSurface.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Icon + Name
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: tool.accentColor.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(tool.icon, color: tool.accentColor, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(tool.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: tool.accentColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(tool.category, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: tool.accentColor)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Description
              Text(tool.description, style: TextStyle(fontSize: 15, height: 1.5, color: cs.onSurface.withOpacity(0.8))),
              const SizedBox(height: 20),

              // How to Use
              Text('How to Use', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 14)),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: cs.primary.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: cs.primary.withOpacity(0.1)),
                ),
                child: Text(tool.howToUse, style: TextStyle(fontSize: 13, height: 1.6, color: cs.onSurface.withOpacity(0.7))),
              ),
              const SizedBox(height: 20),

              // Used In
              Text('Used In', style: TextStyle(fontWeight: FontWeight.bold, color: cs.primary, fontSize: 14)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: tool.usedIn.map((game) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: tool.accentColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: tool.accentColor.withOpacity(0.2)),
                  ),
                  child: Text(game, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: tool.accentColor)),
                )).toList(),
              ),
              const SizedBox(height: 24),

              // Open button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    if (tool.key == 'deck-builder') {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Deck Builder coming soon!')),
                      );
                    } else {
                      context.push('/tools/${tool.key}');
                    }
                  },
                  icon: const Icon(LucideIcons.externalLink, size: 18),
                  label: Text('Open ${tool.name}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: tool.accentColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tools = _filteredTools;

    final toolbar = FilterSortBar(
      showSearch: _showSearch,
      showFilters: _showFilters,
      searchQuery: _searchQuery,
      sortOption: _sortOption,
      sortOptions: const ['Default', 'Name (A-Z)', 'Name (Z-A)'],
      searchHint: 'Search tools...',
      resultCount: tools.length,
      resultLabel: 'tool',
      filterCategories: [
        FilterCategory(
          label: 'Category',
          options: _categories,
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Game Tools', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: toolbar.buildActions(context),
      ),
      body: Column(
        children: [
          toolbar.buildBody(context),
          Expanded(
            child: tools.isEmpty
                ? const EmptyFilterResult(message: 'No tools match your filters')
                : context.watch<AppState>().isGridView
                    ? _buildGrid(tools)
                    : _buildList(tools),
          ),
        ],
      ),
    );
  }

  Widget _buildGrid(List<ToolDefinition> tools) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.85,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: tools.length,
      itemBuilder: (context, index) => _buildGridCard(tools[index]),
    );
  }

  Widget _buildGridCard(ToolDefinition tool) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () {
          if (tool.key == 'deck-builder') {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Deck Builder coming soon!')));
          } else {
            context.push('/tools/${tool.key}');
          }
        },
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: tool.accentColor.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(tool.icon, color: tool.accentColor, size: 28),
                  ),
                  const SizedBox(height: 12),
                  Text(tool.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), textAlign: TextAlign.center),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: tool.accentColor.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(tool.category, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: tool.accentColor)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    tool.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5)),
                  ),
                ],
              ),
            ),
            // Info button
            Positioned(
              top: 4,
              right: 4,
              child: IconButton(
                icon: Icon(LucideIcons.info, size: 18, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3)),
                onPressed: () => _showInfoSheet(tool),
                tooltip: 'About this tool',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(List<ToolDefinition> tools) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: tools.length,
      itemBuilder: (context, index) => _buildListCard(tools[index]),
    );
  }

  Widget _buildListCard(ToolDefinition tool) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () {
          if (tool.key == 'deck-builder') {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Deck Builder coming soon!')));
          } else {
            context.push('/tools/${tool.key}');
          }
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: tool.accentColor.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(tool.icon, color: tool.accentColor, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tool.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 2),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: tool.accentColor.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(tool.category, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: tool.accentColor)),
                    ),
                    const SizedBox(height: 4),
                    Text(tool.description, maxLines: 2, overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5)),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(LucideIcons.info, size: 18, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3)),
                onPressed: () => _showInfoSheet(tool),
              ),
              Icon(LucideIcons.chevronRight, size: 18, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3)),
            ],
          ),
        ),
      ),
    );
  }
}

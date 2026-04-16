import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../utils/l10n.dart';

/// A data class that holds a single filter category with selectable options.
class FilterCategory {
  final String label;
  final Set<String> options;
  final String selected;
  final ValueChanged<String> onSelected;

  const FilterCategory({
    required this.label,
    required this.options,
    required this.selected,
    required this.onSelected,
  });
}

/// A standardized, reusable toolbar that provides:
/// - search bar (toggle from appbar)
/// - sort dropdown (inside expandable filter panel)
/// - filter chips (inside expandable filter panel)
/// - view toggle (grid/list) in appbar
/// - result count + clear filters row
///
/// This widget builds the AppBar actions AND the body header section.
/// Screens compose it by using [buildActions] in their AppBar
/// and placing [buildBody] at the top of their content Column.
class FilterSortBar {
  // ───── State fields (managed by the parent StatefulWidget) ─────
  final bool showSearch;
  final bool showFilters;
  final String searchQuery;
  final String sortOption;
  final List<String> sortOptions;
  final List<FilterCategory> filterCategories;
  final int resultCount;
  final String resultLabel;
  final String searchHint;

  // ───── Callbacks ─────
  final VoidCallback onToggleSearch;
  final VoidCallback onToggleFilters;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onSortChanged;
  final VoidCallback? onClearFilters;

  const FilterSortBar({
    required this.showSearch,
    required this.showFilters,
    required this.searchQuery,
    required this.sortOption,
    required this.sortOptions,
    this.filterCategories = const [],
    required this.resultCount,
    required this.resultLabel,
    required this.searchHint,
    required this.onToggleSearch,
    required this.onToggleFilters,
    required this.onSearchChanged,
    required this.onSortChanged,
    this.onClearFilters,
  });

  /// Whether any filter is active (search text or non-'All' chip).
  bool get hasActiveFilters {
    if (searchQuery.isNotEmpty) return true;
    for (final cat in filterCategories) {
      if (cat.selected != 'All') return true;
    }
    return false;
  }

  /// Builds the standardized AppBar action buttons.
  List<Widget> buildActions(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return [
      // Search toggle
      IconButton(
        icon: Icon(showSearch ? LucideIcons.x : LucideIcons.search),
        onPressed: onToggleSearch,
        tooltip: showSearch ? 'Close Search' : 'Search',
      ),
      // Sort/Filter toggle
      if (filterCategories.isNotEmpty || sortOptions.length > 1)
        IconButton(
          icon: Icon(
            LucideIcons.arrowUpDown,
            color: (showFilters || hasActiveFilters) ? colorScheme.primary : null,
          ),
          onPressed: onToggleFilters,
          tooltip: 'Sort & Filter',
        ),
      // View toggle
      IconButton(
        icon: Icon(context.watch<AppState>().isGridView ? LucideIcons.list : LucideIcons.layoutGrid),
        onPressed: () => context.read<AppState>().toggleViewMode(),
        tooltip: context.read<AppState>().isGridView ? 'List View' : 'Grid View',
        color: colorScheme.primary,
      ),
      // Theme Toggle
      IconButton(
        icon: Icon(context.watch<AppState>().isDarkMode ? LucideIcons.sun : LucideIcons.moon),
        onPressed: () => context.read<AppState>().toggleTheme(),
        tooltip: 'Toggle Theme',
      ),
      // Language Toggle
      TextButton(
        onPressed: () {
          final current = context.read<AppState>().language;
          context.read<AppState>().setLanguage(current == 'en' ? 'id' : 'en');
        },
        child: Text(
          context.watch<AppState>().language.toUpperCase(),
          style: TextStyle(color: colorScheme.primary, fontWeight: FontWeight.bold),
          textScaler: const TextScaler.linear(1.1),
        ),
      ),
    ];
  }

  /// Builds the body header column: search field + filter panel + result count.
  Widget buildBody(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final lang = context.watch<AppState>().language;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // ── Search Bar ──
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          child: showSearch
              ? Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: TextField(
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: searchHint,
                      prefixIcon: Icon(LucideIcons.search, color: colorScheme.primary),
                      suffixIcon: searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(LucideIcons.x, size: 18),
                              onPressed: () => onSearchChanged(''),
                            )
                          : null,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: colorScheme.surface,
                      contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    ),
                    onChanged: onSearchChanged,
                  ),
                )
              : const SizedBox.shrink(),
        ),

        // ── Filter & Sort Panel ──
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          child: showFilters
              ? Container(
                  margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: colorScheme.surface.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: colorScheme.primary.withOpacity(0.15)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Sort row
                      Row(
                        children: [
                          Icon(LucideIcons.arrowUpDown, size: 16, color: colorScheme.primary),
                          const SizedBox(width: 8),
                          Text(L10n.t(lang, 'navSearch') == 'Cari' ? 'Urutkan' : 'Sort', style: TextStyle(fontWeight: FontWeight.bold, color: colorScheme.primary, fontSize: 13)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: sortOption,
                                isExpanded: true,
                                dropdownColor: colorScheme.surface,
                                style: TextStyle(fontWeight: FontWeight.bold, color: colorScheme.onSurface, fontSize: 13),
                                items: sortOptions.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                                onChanged: (val) {
                                  if (val != null) onSortChanged(val);
                                },
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Dynamic filter categories
                      ...filterCategories.map((cat) => Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(cat.label, style: TextStyle(fontWeight: FontWeight.bold, color: colorScheme.primary, fontSize: 13)),
                            const SizedBox(height: 4),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: [
                                _FilterChip(label: L10n.t(lang, 'all'), selected: cat.selected == 'All', onTap: () => cat.onSelected('All')),
                                ...cat.options.map((o) => _FilterChip(label: o, selected: cat.selected == o, onTap: () => cat.onSelected(o))),
                              ],
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                )
              : const SizedBox.shrink(),
        ),

        // ── Result Count Row ──
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
          child: Row(
            children: [
              Text(
                '$resultCount $resultLabel ${L10n.t(lang, 'found')}',
                style: TextStyle(fontSize: 13, color: colorScheme.onSurface.withOpacity(0.5), fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              if (hasActiveFilters && onClearFilters != null)
                GestureDetector(
                  onTap: onClearFilters,
                  child: Row(
                    children: [
                      Icon(LucideIcons.x, size: 14, color: colorScheme.error),
                      const SizedBox(width: 4),
                      Text(L10n.t(lang, 'clearFilters'), style: TextStyle(fontSize: 12, color: colorScheme.error, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}

/// Empty state widget shown when no results match filters.
class EmptyFilterResult extends StatelessWidget {
  final String message;

  const EmptyFilterResult({super.key, this.message = 'No results match your filters'});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.searchX, size: 48, color: colorScheme.onSurface.withOpacity(0.3)),
          const SizedBox(height: 12),
          Text(message, style: TextStyle(color: colorScheme.onSurface.withOpacity(0.5), fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

/// Internal reusable filter chip with the standardized style.
class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? colorScheme.primary : colorScheme.primary.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? colorScheme.primary : colorScheme.primary.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: selected ? colorScheme.onPrimary : colorScheme.primary,
          ),
        ),
      ),
    );
  }
}

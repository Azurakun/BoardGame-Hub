import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/game.dart';
import '../services/api_service.dart';
import '../providers/app_state.dart';
import '../widgets/error_retry_widget.dart';

class AdminManageGamesScreen extends StatefulWidget {
  const AdminManageGamesScreen({super.key});

  @override
  State<AdminManageGamesScreen> createState() => _AdminManageGamesScreenState();
}

class _AdminManageGamesScreenState extends State<AdminManageGamesScreen> {
  late Future<List<Game>> _gamesFuture;

  @override
  void initState() {
    super.initState();
    _refreshGames();
  }

  void _refreshGames() {
    setState(() {
      _gamesFuture = ApiService.fetchGames();
    });
  }

  Future<void> _deleteGame(String id) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Deletion'),
        content: const Text('Are you sure you want to permanently delete this game? This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('CANCEL')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Theme.of(context).colorScheme.error),
            child: const Text('DELETE'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await ApiService.deleteGame(id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Game deleted successfully.')));
          _refreshGames();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<AppState>().language;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Games'),
        actions: [
          IconButton(icon: const Icon(LucideIcons.refreshCcw), onPressed: _refreshGames)
        ],
      ),
      body: FutureBuilder<List<Game>>(
        future: _gamesFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
             return ErrorRetryWidget.fromSnapshot(
               snapshot,
               message: 'Could not load games',
               onRetry: _refreshGames,
             );
          }
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          
          final games = snapshot.data!;
          if (games.isEmpty) return const Center(child: Text('No games available in database.'));

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: games.length,
            itemBuilder: (context, index) {
              final game = games[index];
              return Card(
                elevation: 2,
                margin: const EdgeInsets.only(bottom: 16),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundImage: NetworkImage(ApiService.getImageUrl(game.imageUrl)),
                  ),
                  title: Text(game.name.get(lang), style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('ID: ${game.id}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(LucideIcons.edit, color: Colors.blue),
                        onPressed: () async {
                          final refresh = await context.push('/admin/games/edit', extra: game);
                          if (refresh == true) _refreshGames();
                        },
                      ),
                      IconButton(
                        icon: Icon(LucideIcons.trash2, color: Theme.of(context).colorScheme.error),
                        onPressed: () => _deleteGame(game.id),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final refresh = await context.push('/admin/games/create');
          if (refresh == true) _refreshGames();
        },
        child: const Icon(LucideIcons.plus),
      ),
    );
  }
}

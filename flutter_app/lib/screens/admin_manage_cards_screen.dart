import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/card.dart';
import '../services/api_service.dart';
import '../providers/app_state.dart';
import '../widgets/error_retry_widget.dart';

class AdminManageCardsScreen extends StatefulWidget {
  const AdminManageCardsScreen({super.key});

  @override
  State<AdminManageCardsScreen> createState() => _AdminManageCardsScreenState();
}

class _AdminManageCardsScreenState extends State<AdminManageCardsScreen> {
  late Future<List<GameCard>> _cardsFuture;

  @override
  void initState() {
    super.initState();
    _refreshCards();
  }

  void _refreshCards() {
    setState(() {
      _cardsFuture = ApiService.fetchCards();
    });
  }

  Future<void> _deleteCard(String id) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Deletion'),
        content: const Text('Are you sure you want to permanently delete this card?'),
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
        await ApiService.deleteCard(id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Card deleted successfully.')));
          _refreshCards();
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
        title: const Text('Manage Cards'),
        actions: [
          IconButton(icon: const Icon(LucideIcons.refreshCcw), onPressed: _refreshCards)
        ],
      ),
      body: FutureBuilder<List<GameCard>>(
        future: _cardsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
             return ErrorRetryWidget.fromSnapshot(
               snapshot,
               message: 'Could not load cards',
               onRetry: _refreshCards,
             );
          }
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          
          final cards = snapshot.data!;
          if (cards.isEmpty) return const Center(child: Text('No cards available in database.'));

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: cards.length,
            itemBuilder: (context, index) {
              final card = cards[index];
              return Card(
                elevation: 2,
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: card.imageUrl.isNotEmpty 
                    ? CircleAvatar(backgroundImage: NetworkImage(ApiService.getImageUrl(card.imageUrl)))
                    : const CircleAvatar(child: Icon(LucideIcons.fileQuestion)),
                  title: Text(card.name.get(lang), style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('Game ID: ${card.gameId} | Type: ${card.type.get(lang)}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(LucideIcons.edit, color: Colors.blue),
                        onPressed: () async {
                          final refresh = await context.push('/admin/cards/edit', extra: card);
                          if (refresh == true) _refreshCards();
                        },
                      ),
                      IconButton(
                        icon: Icon(LucideIcons.trash2, color: Theme.of(context).colorScheme.error),
                        onPressed: () => _deleteCard(card.id),
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
          final refresh = await context.push('/admin/cards/create');
          if (refresh == true) _refreshCards();
        },
        child: const Icon(LucideIcons.plus),
      ),
    );
  }
}

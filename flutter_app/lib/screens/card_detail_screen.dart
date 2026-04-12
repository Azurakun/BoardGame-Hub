import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/card.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';

class CardDetailScreen extends StatelessWidget {
  final GameCard card;
  const CardDetailScreen({super.key, required this.card});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<AppState>().language;
    final primaryColor = Theme.of(context).colorScheme.primary;

    return Scaffold(
      appBar: AppBar(title: Text(card.name.get(lang))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (card.imageUrl.isNotEmpty)
              Hero(
                tag: 'card_img_${card.id}',
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.network(
                    ApiService.getImageUrl(card.imageUrl),
                    fit: BoxFit.cover,
                    height: 300,
                  ),
                ),
              ),
            const SizedBox(height: 24),
            
            // Name and Type Header
            Text(card.name.get(lang), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            Text(card.type.get(lang), style: TextStyle(color: primaryColor, fontSize: 18, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            const SizedBox(height: 24),

            // Optional Dynamic Stats Row
            if (card.hp != null || card.mana != null || card.attack != null || card.defense != null)
              Container(
                margin: const EdgeInsets.only(bottom: 24),
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: primaryColor.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))]
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    if (card.hp != null) _buildStatBadge(context, LucideIcons.heart, card.hp.toString(), Theme.of(context).colorScheme.tertiary),
                    if (card.mana != null) _buildStatBadge(context, LucideIcons.droplets, card.mana.toString(), Colors.blueAccent),
                    if (card.attack != null) _buildStatBadge(context, LucideIcons.swords, card.attack.toString(), Colors.orangeAccent),
                    if (card.defense != null) _buildStatBadge(context, LucideIcons.shield, card.defense.toString(), Theme.of(context).colorScheme.secondary),
                  ],
                ),
              ),

            // Effect Card
            Card(
              margin: const EdgeInsets.only(bottom: 16),
              elevation: 4,
              shadowColor: primaryColor.withOpacity(0.2),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.sparkles, color: primaryColor),
                        const SizedBox(width: 8),
                        const Text('Card Effect', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(height: 30),
                    Text(card.effect.get(lang), style: const TextStyle(fontSize: 16, height: 1.5)),
                  ],
                ),
              ),
            ),

            // Optional Lore Card
            if (card.lore.get(lang).isNotEmpty)
              Card(
                elevation: 2,
                color: Theme.of(context).colorScheme.background,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(LucideIcons.bookOpen, color: Theme.of(context).colorScheme.secondary),
                          const SizedBox(width: 8),
                          const Text('Lore', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text('"${card.lore.get(lang)}"', style: const TextStyle(fontStyle: FontStyle.italic, fontSize: 16, color: Colors.grey, height: 1.5)),
                    ],
                  ),
                ),
              ),
              
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBadge(BuildContext context, IconData icon, String value, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withOpacity(0.15), shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 28),
        ),
        const SizedBox(height: 8),
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Theme.of(context).textTheme.bodyLarge?.color)),
      ],
    );
  }
}

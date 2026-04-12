import 'game.dart';

class GameCard {
  final String id;
  final String gameId;
  final LocalizedString name;
  final LocalizedString type;
  final LocalizedString effect;
  final LocalizedString lore;
  final String imageUrl;
  final String color;
  final int? hp;
  final int? mana;
  final int? attack;
  final int? defense;

  GameCard({
    required this.id,
    required this.gameId,
    required this.name,
    required this.type,
    required this.effect,
    required this.lore,
    required this.imageUrl,
    required this.color,
    this.hp,
    this.mana,
    this.attack,
    this.defense,
  });

  factory GameCard.fromJson(Map<String, dynamic> json) {
    return GameCard(
      id: json['id'] ?? '',
      gameId: json['gameId'] ?? '',
      name: LocalizedString.fromJson(json['name']),
      type: LocalizedString.fromJson(json['type']),
      effect: LocalizedString.fromJson(json['effect']),
      lore: LocalizedString.fromJson(json['lore']),
      imageUrl: json['imageUrl'] ?? '',
      color: json['color'] ?? '#ffffff',
      hp: json['hp'] != null ? (json['hp'] as num).toInt() : null,
      mana: json['mana'] != null ? (json['mana'] as num).toInt() : null,
      attack: json['attack'] != null ? (json['attack'] as num).toInt() : null,
      defense: json['defense'] != null ? (json['defense'] as num).toInt() : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id.isNotEmpty ? id : null, // If creating, node backend drops 'id' safely
      'gameId': gameId,
      'name': name.toJson(),
      'type': type.toJson(),
      'effect': effect.toJson(),
      'lore': lore.toJson(),
      'imageUrl': imageUrl,
      'color': color,
      if (hp != null) 'hp': hp,
      if (mana != null) 'mana': mana,
      if (attack != null) 'attack': attack,
      if (defense != null) 'defense': defense,
    };
  }
}

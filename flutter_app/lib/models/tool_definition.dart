import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

/// Centralized metadata for every tool in the Game Tools section.
class ToolDefinition {
  final String key;
  final String name;
  final String category;
  final String description;
  final String howToUse;
  final List<String> usedIn;
  final IconData icon;
  final Color accentColor;

  const ToolDefinition({
    required this.key,
    required this.name,
    required this.category,
    required this.description,
    required this.howToUse,
    required this.usedIn,
    required this.icon,
    required this.accentColor,
  });

  static const List<ToolDefinition> allTools = [
    ToolDefinition(
      key: 'dice',
      name: 'Dice Roller',
      category: 'Randomizer',
      description: 'Roll virtual dice of any type — d4, d6, d8, d10, d12, or the legendary d20. Support for multi‑dice rolls, sum tracking, and roll history.',
      howToUse: 'Step 1: Tap the mystical cube of fate.\nStep 2: Pray to the RNG gods.\nStep 3: Blame the app when you roll a 1.\n\nPro tip: Rolling harder does NOT help — we checked.',
      usedIn: ['Catan', 'D&D', 'Monopoly', 'Risk', 'Yahtzee'],
      icon: LucideIcons.dice5,
      accentColor: Color(0xFFEF4444),
    ),
    ToolDefinition(
      key: 'coin',
      name: 'Coin Flip',
      category: 'Randomizer',
      description: 'A classic coin flip with a satisfying 3D flip animation. Tracks your flip history and shows heads/tails statistics.',
      howToUse: 'Tap the coin. Watch it flip. Accept your fate.\n\nUnlike real coins, this one can\'t fall off the table, roll under the couch, or land on its edge.\n\nYou\'re welcome.',
      usedIn: ['Any game needing a 50/50', 'Settling disputes', 'Deciding who pays for lunch'],
      icon: LucideIcons.coins,
      accentColor: Color(0xFFF59E0B),
    ),
    ToolDefinition(
      key: 'score',
      name: 'Score Counter',
      category: 'Tracker',
      description: 'Track scores for up to 8 players with customizable point increments, undo history, and automatic leader highlighting.',
      howToUse: 'Tap + to add points. Tap − to subtract. Repeat until someone wins.\n\nNo, you cannot "accidentally" subtract from your opponent\'s score. We see you.',
      usedIn: ['Catan', 'Ticket to Ride', 'Scrabble', 'Any score-based game'],
      icon: LucideIcons.trophy,
      accentColor: Color(0xFF8B5CF6),
    ),
    ToolDefinition(
      key: 'timer',
      name: 'Turn Timer',
      category: 'Tracker',
      description: 'A real countdown chess clock supporting 2–8 players. Features 180° rotated display for 2-player phone-on-table mode, time presets, and player elimination.',
      howToUse: 'Set your time, tap to switch turns.\n\nThe only clock where blaming lag is a valid excuse.\n\nFor 2 players: place the phone flat on the table between you. Your half is upside down — that\'s a feature, not a bug.',
      usedIn: ['Chess', 'Scrabble', 'Go', 'Any timed game'],
      icon: LucideIcons.timer,
      accentColor: Color(0xFF06B6D4),
    ),
    ToolDefinition(
      key: 'first-player',
      name: 'First Player',
      category: 'Randomizer',
      description: 'Can\'t decide who goes first? Let fate decide with an animated player picker, random turn order generator, or elimination mode.',
      howToUse: 'Enter player names, pick a mode, and tap Go.\n\nThe spinner will dramatically slow down and land on someone. That someone has no right to complain.\n\nIf only one name is entered: "Congratulations, you go first! And second. And every turn after that."',
      usedIn: ['All board games', 'Party games', 'Settling who orders pizza'],
      icon: LucideIcons.users,
      accentColor: Color(0xFF10B981),
    ),
    ToolDefinition(
      key: 'life-counter',
      name: 'Life Counter',
      category: 'Tracker',
      description: 'Track health or life points for 1–4 players in a split-screen layout. Presets for MTG (20/40), Yu-Gi-Oh (8000), Pokémon (6), or custom values.',
      howToUse: 'Tap the top half of your zone to gain life.\nTap the bottom half to lose life.\nLong press for ±5.\n\nWhen you hit 0, the screen will helpfully inform you that you are, in fact, eliminated. As if you didn\'t already know.',
      usedIn: ['Magic: The Gathering', 'Yu-Gi-Oh', 'Pokémon TCG', 'Munchkin'],
      icon: LucideIcons.heart,
      accentColor: Color(0xFFEC4899),
    ),
    ToolDefinition(
      key: 'deck-builder',
      name: 'Deck Builder',
      category: 'Simulator',
      description: 'Build a Pokémon TCG deck from the card catalog. Browse cards, assemble your 60-card deck, and analyze your energy curve, type distribution, and more.',
      howToUse: 'Browse the card catalog, tap to add cards to your deck.\nCheck the analytics tab for deck insights.\nSave your deck for later.\n\nDisclaimer: We cannot guarantee your deck will actually win. That part is on you.',
      usedIn: ['Pokémon TCG'],
      icon: LucideIcons.layers,
      accentColor: Color(0xFF3B82F6),
    ),
    ToolDefinition(
      key: 'spinner',
      name: 'Spinner Wheel',
      category: 'Randomizer',
      description: 'A customizable spinning wheel with 2–12 segments. Add your own labels, pick from presets, and spin with realistic deceleration physics.',
      howToUse: 'Add your segments (or pick a preset), then spin.\n\nPhysics guaranteed to be approximately close to real-world friction. Approximately.\n\nProtip: Staring at the wheel intensely does not influence the result. Probably.',
      usedIn: ['Truth or Dare', 'Custom house rules', 'Random events', 'Deciding what to eat'],
      icon: LucideIcons.disc,
      accentColor: Color(0xFFF97316),
    ),
  ];
}

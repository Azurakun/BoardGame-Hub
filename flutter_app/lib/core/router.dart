import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/shell_screen.dart';
import '../screens/home_screen.dart';
import '../screens/wiki_screen.dart';
import '../screens/cards_screen.dart';
import '../screens/tools_screen.dart';
import '../screens/game_detail_screen.dart';
import '../screens/admin_login_screen.dart';
import '../screens/admin_dashboard_screen.dart';
import '../screens/admin_manage_games_screen.dart';
import '../screens/admin_manage_cards_screen.dart';
import '../screens/admin_game_form_screen.dart';
import '../screens/admin_card_form_screen.dart';
import '../screens/card_detail_screen.dart';
import '../models/card.dart';
import '../models/game.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: [
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return ShellScreen(child: child);
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/wiki',
          builder: (context, state) => const WikiScreen(),
        ),
        GoRoute(
          path: '/cards',
          builder: (context, state) => const CardsScreen(),
        ),
        GoRoute(
          path: '/tools',
          builder: (context, state) => const ToolsScreen(),
        ),
      ],
    ),
    GoRoute(
      path: '/game/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return GameDetailScreen(gameId: id);
      },
    ),
    GoRoute(
      path: '/admin/login',
      builder: (context, state) => const AdminLoginScreen(),
    ),
    GoRoute(
      path: '/admin/dashboard',
      builder: (context, state) => const AdminDashboardScreen(),
    ),
    GoRoute(
      path: '/admin/games',
      builder: (context, state) => const AdminManageGamesScreen(),
    ),
    GoRoute(
      path: '/admin/games/create',
      builder: (context, state) => const AdminGameFormScreen(),
    ),
    GoRoute(
      path: '/admin/games/edit',
      builder: (context, state) {
        final game = state.extra as Game;
        return AdminGameFormScreen(game: game);
      },
    ),
    GoRoute(
      path: '/admin/cards',
      builder: (context, state) => const AdminManageCardsScreen(),
    ),
    GoRoute(
      path: '/admin/cards/create',
      builder: (context, state) => const AdminCardFormScreen(),
    ),
    GoRoute(
      path: '/admin/cards/edit',
      builder: (context, state) {
        final card = state.extra as GameCard;
        return AdminCardFormScreen(card: card);
      },
    ),
    GoRoute(
      path: '/card',
      builder: (context, state) {
        final card = state.extra as GameCard;
        return CardDetailScreen(card: card);
      },
    ),
  ],
);

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../widgets/animated_background.dart';

class ShellScreen extends StatelessWidget {
  final Widget child;

  const ShellScreen({super.key, required this.child});

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;
    if (location == '/') return 0;
    if (location.startsWith('/wiki') || location.startsWith('/game')) return 1;
    if (location.startsWith('/search')) return 2;
    if (location.startsWith('/cards')) return 3;
    if (location.startsWith('/tools')) return 4;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/wiki');
        break;
      case 2:
        context.go('/search');
        break;
      case 3:
        context.go('/cards');
        break;
      case 4:
        context.go('/tools');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final int currentIndex = _calculateSelectedIndex(context);

    return Scaffold(
      body: AnimatedBackground(child: child),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).shadowColor.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -5),
            )
          ]
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          child: BottomNavigationBar(
            currentIndex: currentIndex,
            onTap: (index) => _onItemTapped(index, context),
            type: BottomNavigationBarType.fixed,
            backgroundColor: Theme.of(context).colorScheme.surface,
            selectedItemColor: Theme.of(context).colorScheme.primary,
            unselectedItemColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
            elevation: 0,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.bookOpen),
                label: 'Wiki',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.search),
                label: 'Search',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.library),
                label: 'Cards',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.wrench),
                label: 'Tools',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

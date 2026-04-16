import 'package:flutter/material.dart';

class L10n {
  static const Map<String, Map<String, String>> _strings = {
    // Nav 
    'navHome': {
      'en': 'Home',
      'id': 'Beranda'
    },
    'navWiki': {
      'en': 'Wiki',
      'id': 'Wiki'
    },
    'navSearch': {
      'en': 'Search',
      'id': 'Cari'
    },
    'navCards': {
      'en': 'Cards',
      'id': 'Kartu'
    },
    'navTools': {
      'en': 'Tools',
      'id': 'Alat'
    },

    // AppBars
    'titleWiki': {
      'en': 'Game Library',
      'id': 'Pustaka Permainan'
    },
    'titleCards': {
      'en': 'Card Compendium',
      'id': 'Kompilasi Kartu'
    },
    'titleTools': {
      'en': 'Game Tools',
      'id': 'Peralatan'
    },
    'titleSearch': {
      'en': 'Search',
      'id': 'Pencarian'
    },
    'titleSettings': {
      'en': 'Admin Settings',
      'id': 'Pengaturan Admin'
    },

    // Search / Filter
    'searchHintBase': {
      'en': 'Search anywhere...',
      'id': 'Cari di mana saja...'
    },
    'searchHintWiki': {
      'en': 'Search games by name or description...',
      'id': 'Cari permainan berdasarkan nama atau deskripsi...'
    },
    'searchHintCards': {
      'en': 'Search cards by name or effect...',
      'id': 'Cari kartu berdasarkan nama atau efek...'
    },
    'searchHintTools': {
      'en': 'Search tools...',
      'id': 'Cari peralatan...'
    },
    'emptyResultSearch': {
      'en': 'Type to discover games, cards, or tools.',
      'id': 'Ketik untuk menjelajahi permainan, kartu, atau alat.'
    },
    'emptyResultEmpty': {
      'en': 'No results found.',
      'id': 'Tidak ada hasil yang ditemukan.'
    },
    'emptyResultGames': {
      'en': 'No games match your filters',
      'id': 'Tidak ada permainan yang cocok dengan filter'
    },
    'emptyResultCards': {
      'en': 'No cards match your filters',
      'id': 'Tidak ada kartu yang cocok dengan filter'
    },
    'emptyResultTools': {
      'en': 'No tools found matching your criteria',
      'id': 'Tidak ada peralatan yang cocok'
    },
    
    // Sort Options
    'sortNameAZ': {
      'en': 'Name (A-Z)',
      'id': 'Nama (A-Z)'
    },
    'sortNameZA': {
      'en': 'Name (Z-A)',
      'id': 'Nama (Z-A)'
    },
    'sortPlaytime': {
      'en': 'Playtime',
      'id': 'Waktu Bermain'
    },
    'sortPlayers': {
      'en': 'Players',
      'id': 'Jumlah Pemain'
    },
    'sortType': {
      'en': 'Type',
      'id': 'Tipe'
    },
    'sortDefault': {
      'en': 'Default',
      'id': 'Standar'
    },
    
    // General 
    'all': {
      'en': 'All',
      'id': 'Semua'
    },
    'category': {
      'en': 'Category',
      'id': 'Kategori'
    },
    'resultType': {
      'en': 'Result Type',
      'id': 'Tipe Hasil'
    },
    'clearFilters': {
      'en': 'Clear filters',
      'id': 'Hapus filter'
    },
    'found': {
      'en': 'found',
      'id': 'ditemukan'
    },

    // Home
    'homeGreeting': {
      'en': 'Ready to play?',
      'id': 'Siap bermain?'
    },
    'homeSubtitle': {
      'en': 'Discover & Organize\nYour Tabletop Journey',
      'id': 'Jelajahi & Atur\nPetualangan Anda'
    },
    'homeChallenge': {
      'en': 'Today\'s Challenge!',
      'id': 'Tantangan Hari Ini!'
    },
    'homeQuickActionCard': {
      'en': 'Deck List',
      'id': 'Daftar Dek'
    },
    'homeQuickActionFind': {
      'en': 'Find Game',
      'id': 'Cari Game'
    },
    'homeQuickActionRoll': {
      'en': 'Roll Dice',
      'id': 'Lempar Dadu'
    },
    'homeNewsTitle': {
      'en': 'Board Game News',
      'id': 'Berita Papan Permainan'
    },
    'homeToolsTitle': {
      'en': 'Essential Tools',
      'id': 'Peralatan Esensial'
    },
    'readMore': {
      'en': 'Read More',
      'id': 'Baca Selengkapnya'
    },
    'playTime': {
      'en': 'Min',
      'id': 'Menit'
    },
    'complexity': {
      'en': 'Complexity',
      'id': 'Kompleksitas'
    }
  };

  static String t(String lang, String key) {
    if (!_strings.containsKey(key)) {
      debugPrint('Warning: Missing translation key: \$key');
      return key;
    }
    return _strings[key]![lang] ?? _strings[key]!['en']!;
  }
}

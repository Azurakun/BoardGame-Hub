class LocalizedString {
  final String en;
  final String id;

  LocalizedString({required this.en, required this.id});

  factory LocalizedString.fromJson(Map<String, dynamic>? json) {
    if (json == null) return LocalizedString(en: '', id: '');
    return LocalizedString(
      en: json['en'] ?? '',
      id: json['id'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'en': en, 'id': id};

  String get(String tempLang) => tempLang == 'id' ? id : en;
}

class GameRule {
  final LocalizedString title;
  final LocalizedString content;

  GameRule({required this.title, required this.content});

  factory GameRule.fromJson(Map<String, dynamic> json) {
    return GameRule(
      title: LocalizedString.fromJson(json['title']),
      content: LocalizedString.fromJson(json['content']),
    );
  }

  Map<String, dynamic> toJson() => {
    'title': title.toJson(),
    'content': content.toJson(),
  };
}

class GameFaq {
  final LocalizedString q;
  final LocalizedString a;

  GameFaq({required this.q, required this.a});

  factory GameFaq.fromJson(Map<String, dynamic> json) {
    return GameFaq(
        q: LocalizedString.fromJson(json['q']),
        a: LocalizedString.fromJson(json['a'])
    );
  }

  Map<String, dynamic> toJson() => {
    'q': q.toJson(),
    'a': a.toJson(),
  };
}

class Game {
  final String id;
  final LocalizedString name;
  final List<String> category;
  final LocalizedString shortDescription;
  final LocalizedString description;
  final int minPlayers;
  final int maxPlayers;
  final int playTime;
  final int complexity;
  final String designer;
  final int yearPublished;
  final List<String> mechanics;
  final String imageUrl;
  final String? videoUrl;
  final LocalizedString howToPlay;
  final List<GameRule> rules;
  final List<GameFaq> faq;

  Game({
    required this.id, required this.name, required this.category, required this.shortDescription,
    required this.description, required this.minPlayers, required this.maxPlayers,
    required this.playTime, required this.complexity, required this.designer,
    required this.yearPublished, required this.mechanics, required this.imageUrl,
    this.videoUrl, required this.howToPlay, required this.rules, required this.faq
  });

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      id: json['id'] ?? '',
      name: LocalizedString.fromJson(json['name']),
      category: List<String>.from(json['category'] ?? []),
      shortDescription: LocalizedString.fromJson(json['shortDescription']),
      description: LocalizedString.fromJson(json['description']),
      minPlayers: json['minPlayers'] ?? 1,
      maxPlayers: json['maxPlayers'] ?? 4,
      playTime: json['playTime'] ?? 30,
      complexity: json['complexity'] ?? 1,
      designer: json['designer'] ?? '',
      yearPublished: json['yearPublished'] ?? 2020,
      mechanics: List<String>.from(json['mechanics'] ?? []),
      imageUrl: json['imageUrl'] ?? '',
      videoUrl: json['videoUrl'],
      howToPlay: LocalizedString(
        en: (json['howToPlay']?['en'] as List?)?.join('\n') ?? '',
        id: (json['howToPlay']?['id'] as List?)?.join('\n') ?? '',
      ),
      rules: (json['rules'] as List?)?.map((r) => GameRule.fromJson(r)).toList() ?? [],
      faq: (json['faq'] as List?)?.map((f) => GameFaq.fromJson(f)).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name.toJson(),
      'category': category,
      'shortDescription': shortDescription.toJson(),
      'description': description.toJson(),
      'minPlayers': minPlayers,
      'maxPlayers': maxPlayers,
      'playTime': playTime,
      'complexity': complexity,
      'designer': designer,
      'yearPublished': yearPublished,
      'mechanics': mechanics,
      'imageUrl': imageUrl,
      if (videoUrl != null && videoUrl!.isNotEmpty) 'videoUrl': videoUrl,
      'howToPlay': {
        'en': howToPlay.en.split('\n'),
        'id': howToPlay.id.split('\n'),
      },
      'rules': rules.map((r) => r.toJson()).toList(),
      'faq': faq.map((f) => f.toJson()).toList(),
    };
  }
}

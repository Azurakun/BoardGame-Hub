import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/game.dart';
import '../models/card.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulators, or use the local IP if on a real device.
  // For real devices on the same WiFi network, use your PC's local IP address.
  static const String baseUrl = 'http://192.168.1.61:5000/api';

  static String getImageUrl(String path) {
    if (path.startsWith('http')) return path;
    return 'http://192.168.1.61:5000$path';
  }

  static Future<List<Game>> fetchGames() async {
    final response = await http.get(Uri.parse('$baseUrl/games'));
    if (response.statusCode == 200) {
      final List<dynamic> jsonList = json.decode(response.body);
      return jsonList.map((json) => Game.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load games');
    }
  }

  static Future<List<GameCard>> fetchCards() async {
    final response = await http.get(Uri.parse('$baseUrl/cards'));
    if (response.statusCode == 200) {
      final List<dynamic> jsonList = json.decode(response.body);
      return jsonList.map((json) => GameCard.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load cards');
    }
  }
  static Future<Map<String, dynamic>> fetchDashboardStats() async {
    final response = await http.get(Uri.parse('$baseUrl/dashboard/stats'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load dashboard stats');
    }
  }

  static Future<void> deleteGame(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/games/$id'));
    if (response.statusCode != 204 && response.statusCode != 200) {
      throw Exception('Failed to delete game');
    }
  }

  static Future<void> deleteCard(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/cards/$id'));
    if (response.statusCode != 204 && response.statusCode != 200) {
      throw Exception('Failed to delete card');
    }
  }

  static Future<void> createGame(Game game) async {
    final response = await http.post(
      Uri.parse('$baseUrl/games'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(game.toJson()),
    );
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to create game');
    }
  }

  static Future<void> updateGame(Game game) async {
    final response = await http.put(
      Uri.parse('$baseUrl/games/${game.id}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(game.toJson()),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update game');
    }
  }

  static Future<void> createCard(GameCard card) async {
    final response = await http.post(
      Uri.parse('$baseUrl/cards'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(card.toJson()),
    );
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to create card');
    }
  }

  static Future<void> updateCard(GameCard card) async {
    final response = await http.put(
      Uri.parse('$baseUrl/cards/${card.id}'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(card.toJson()),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update card');
    }
  }

  static Future<String> uploadImage(File file) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/upload'));
    request.files.add(await http.MultipartFile.fromPath('image', file.path));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201 || response.statusCode == 200) {
      final jsonResponse = json.decode(response.body);
      return jsonResponse['url']; // e.g. /uploads/123.png
    } else {
      throw Exception('Failed to upload image. Server returned ${response.statusCode}');
    }
  }
}

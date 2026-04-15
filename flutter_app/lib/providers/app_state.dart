import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppState extends ChangeNotifier {
  final SharedPreferences _prefs;
  
  bool _isDarkMode = false;
  String _language = 'en'; // 'en' or 'id'
  bool _isAdminLoggedIn = false;
  bool _isGridView = false;

  AppState(this._prefs) {
    _isDarkMode = _prefs.getBool('isDarkMode') ?? false;
    _language = _prefs.getString('language') ?? 'en';
    _isGridView = _prefs.getBool('isGridView') ?? false;
  }

  bool get isDarkMode => _isDarkMode;
  String get language => _language;
  bool get isAdminLoggedIn => _isAdminLoggedIn;
  bool get isGridView => _isGridView;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    _prefs.setBool('isDarkMode', _isDarkMode);
    notifyListeners();
  }

  void setLanguage(String lang) {
    _language = lang;
    _prefs.setString('language', _language);
    notifyListeners();
  }

  void toggleViewMode() {
    _isGridView = !_isGridView;
    _prefs.setBool('isGridView', _isGridView);
    notifyListeners();
  }

  void loginAdmin() {
    _isAdminLoggedIn = true;
    notifyListeners();
  }

  void logoutAdmin() {
    _isAdminLoggedIn = false;
    notifyListeners();
  }
}

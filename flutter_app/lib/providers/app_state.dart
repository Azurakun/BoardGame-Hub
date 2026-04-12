import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppState extends ChangeNotifier {
  final SharedPreferences _prefs;
  
  bool _isDarkMode = true;
  String _language = 'en'; // 'en' or 'id'
  bool _isAdminLoggedIn = false;

  AppState(this._prefs) {
    _isDarkMode = _prefs.getBool('isDarkMode') ?? true;
    _language = _prefs.getString('language') ?? 'en';
  }

  bool get isDarkMode => _isDarkMode;
  String get language => _language;
  bool get isAdminLoggedIn => _isAdminLoggedIn;

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

  void loginAdmin() {
    _isAdminLoggedIn = true;
    notifyListeners();
  }

  void logoutAdmin() {
    _isAdminLoggedIn = false;
    notifyListeners();
  }
}

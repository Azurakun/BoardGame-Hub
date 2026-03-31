import { Link, useLocation } from 'react-router';
import { BookOpen, Home, Moon, Sun, Globe, Shield, LogOut, LibrarySquare, Wrench, BookOpen as CardsIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { MobileBottomNav } from './MobileBottomNav';

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const DesktopNavLinks = () => (
    <>
      <Link
        to="/"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/')
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">{t('nav.home')}</span>
      </Link>
      <Link
        to="/wiki"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/wiki')
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
      >
        <LibrarySquare className="w-4 h-4" />
        <span className="text-sm font-medium">{t('nav.wiki')}</span>
      </Link>
      <Link
        to="/tools"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/tools')
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
      >
        <Wrench className="w-4 h-4" />
        <span className="text-sm font-medium">{t('nav.tools')}</span>
      </Link>
      <Link
        to="/cards"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/cards')
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-sm font-medium">{t('nav.cards')}</span>
      </Link>
      {isAdmin && (
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive('/admin/dashboard')
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
        >
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 transition-colors duration-200 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800/50">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-lg md:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {t('nav.app_name')}
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <DesktopNavLinks />
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-2 border-l border-gray-200 dark:border-slate-800 pl-4 ml-2">
              <button
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={language === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAdmin && (
                <button
                  onClick={logout}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                  title="Logout Admin"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile Controls (language + theme only, no hamburger) */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {isAdmin && (
                <button
                  onClick={logout}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Main content with bottom padding for mobile nav */}
      <main className="min-h-[calc(100vh-8rem)] pb-24 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-800/10 mt-auto pb-24 md:pb-6">
        <div className="flex items-center justify-center gap-4">
          <p>© {new Date().getFullYear()} {t('nav.app_name')}. All rights reserved.</p>
          {!isAdmin && (
            <Link to="/admin/login" className="hidden md:flex opacity-30 hover:opacity-100 items-center gap-1 transition-opacity">
              <Shield className="w-3 h-3" /> Admin
            </Link>
          )}
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

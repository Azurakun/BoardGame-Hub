import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Home, LibrarySquare, Wrench, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/wiki', icon: LibrarySquare, label: t('nav.wiki') },
    { path: '/tools', icon: Wrench, label: t('nav.tools') },
    { path: '/cards', icon: BookOpen, label: t('nav.cards') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphic background */}
      <div className="mx-3 mb-3">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-2xl shadow-black/10 dark:shadow-black/30 px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
                  }`}
                >
                  {/* Active indicator pill */}
                  {active && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="text-[10px] font-semibold relative z-10 leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, LibrarySquare, LayoutGrid, List } from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useGames } from '../contexts/GamesContext';

type ViewMode = 'grid' | 'list';

export function Wiki() {
    const { language, t } = useLanguage();
    const { games } = useGames();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const allCategories = useMemo(() => {
        const cats = new Set<string>();
        games.forEach(game => game.category.forEach(c => cats.add(c)));
        return Array.from(cats).sort();
    }, [games]);

    const filteredGames = useMemo(() => {
        return games.filter(game => {
            const matchesSearch = game.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.shortDescription[language].toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? game.category.includes(selectedCategory) : true;
            return matchesSearch && matchesCategory;
        });
    }, [games, searchQuery, selectedCategory, language]);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 md:py-12">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <LibrarySquare className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                {t('wiki.title')}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                                {t('wiki.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1 shadow-sm shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'grid'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Grid</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            <span className="hidden sm:inline">List</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder={t('search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-slate-800 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {allCategories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${selectedCategory === category
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Count */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-medium">
                {filteredGames.length} {language === 'en' ? 'games found' : 'permainan ditemukan'}
            </p>

            {/* Games Grid / List */}
            {filteredGames.length > 0 ? (
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'flex flex-col gap-3'
                    }
                >
                    {filteredGames.map((game, idx) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.04 * Math.min(idx, 8) }}
                        >
                            <GameCard game={game} variant={viewMode} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">{t('search.empty')}</p>
                </div>
            )}
        </div>
    );
}

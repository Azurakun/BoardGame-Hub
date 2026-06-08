import { Search, X, Filter, BookOpen, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCards } from '../contexts/CardsContext';
import { useGames } from '../contexts/GamesContext';
import { Card } from '../data/cards';
import { getImageUrl } from '../config';

type CardViewMode = 'grid' | 'list';

export function CardViewer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGames, setSelectedGames] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<CardViewMode>('grid');

    const { t, language } = useLanguage();
    const { cards } = useCards();
    const { games } = useGames();

    const uniqueTypes = useMemo(() => {
        const types = new Set<string>();
        cards.forEach(card => types.add(card.type[language]));
        return Array.from(types).sort();
    }, [cards, language]);

    const handleGameToggle = (gameId: string) => {
        setSelectedGames(prev =>
            prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
        );
    };

    const handleTypeToggle = (typeStr: string) => {
        setSelectedTypes(prev =>
            prev.includes(typeStr) ? prev.filter(t => t !== typeStr) : [...prev, typeStr]
        );
    };

    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            const matchesSearch =
                card.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.effect[language].toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGame = selectedGames.length === 0 || selectedGames.includes(card.gameId);
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(card.type[language]);
            return matchesSearch && matchesGame && matchesType;
        });
    }, [cards, searchQuery, selectedGames, selectedTypes, language]);

    // --- Card navigation ---
    const selectedCardIndex = useMemo(() => {
        if (!selectedCard) return -1;
        return filteredCards.findIndex(c => c.id === selectedCard.id);
    }, [selectedCard, filteredCards]);

    const canGoPrev = selectedCardIndex > 0;
    const canGoNext = selectedCardIndex >= 0 && selectedCardIndex < filteredCards.length - 1;

    const goToPrev = useCallback(() => {
        if (canGoPrev) setSelectedCard(filteredCards[selectedCardIndex - 1]);
    }, [canGoPrev, filteredCards, selectedCardIndex]);

    const goToNext = useCallback(() => {
        if (canGoNext) setSelectedCard(filteredCards[selectedCardIndex + 1]);
    }, [canGoNext, filteredCards, selectedCardIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!selectedCard) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrev(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
            if (e.key === 'Escape') setSelectedCard(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedCard, goToPrev, goToNext]);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 md:py-12 flex flex-col md:flex-row gap-8 relative">

            {/* Mobile Filter Toggle Button */}
            <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 font-semibold"
            >
                <Filter className="w-5 h-5" /> Filters
            </button>

            {/* Sidebar Filters */}
            <aside className={`fixed top-0 left-0 h-full w-full sm:w-[320px] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-6 z-50 transition-transform duration-300 overflow-y-auto ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-fit md:w-64 lg:w-72 md:block md:z-0`}>
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <h2 className="text-xl font-bold dark:text-white">Filters</h2>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="mb-8">
                    <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Games</h3>
                    <div className="space-y-3">
                        {games.map(game => (
                            <label key={game.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedGames.includes(game.id)}
                                    onChange={() => handleGameToggle(game.id)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">{game.name[language]}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Card Types</h3>
                    <div className="space-y-3">
                        {uniqueTypes.map(type => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => handleTypeToggle(type)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1">
                {/* Page Header — consistent with Wiki & Tools */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{t('cards.title')}</h1>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">{t('cards.subtitle')}</p>
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

                {/* Search Bar */}
                <div className="relative w-full max-w-xl mb-8">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder={t('cards.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                </div>

                {/* Card Count */}
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-medium">
                    {filteredCards.length} {language === 'en' ? 'cards found' : 'kartu ditemukan'}
                </p>

                {/* Cards Display */}
                {filteredCards.length > 0 ? (
                    viewMode === 'grid' ? (
                        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            <AnimatePresence>
                                {filteredCards.map((card) => (
                                    <motion.div
                                        layout
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        whileHover={{ scale: 1.02, translateY: -5 }}
                                        onClick={() => setSelectedCard(card)}
                                        className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer group flex flex-col"
                                    >
                                        <div className="aspect-[2/3] relative bg-gray-100 dark:bg-slate-900 overflow-hidden">
                                            <img src={getImageUrl(card.imageUrl)} alt={card.name[language]} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105" />
                                            <div style={{ backgroundColor: card.color + 'cc' }} className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow backdrop-blur-md border border-white/20">
                                                {card.type[language]}
                                            </div>
                                        </div>
                                        <div className="p-3 md:p-4 flex-1 flex flex-col">
                                            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {card.name[language]}
                                            </h3>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug line-clamp-2 mt-auto">
                                                {card.effect[language]}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        /* List View */
                        <div className="flex flex-col gap-3">
                            {filteredCards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedCard(card)}
                                    className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer group flex flex-row items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 overflow-hidden bg-gray-100 dark:bg-slate-900 m-2 rounded-lg">
                                        <img src={getImageUrl(card.imageUrl)} alt={card.name[language]} className="w-full h-full object-cover" />
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 py-3 pr-4 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {card.name[language]}
                                            </h3>
                                            <span style={{ backgroundColor: card.color + '15', color: card.color, borderColor: card.color + '30' }} className="px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0">
                                                {card.type[language]}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {card.effect[language]}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 mr-4 shrink-0 group-hover:text-indigo-400 transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('cards.empty')}</p>
                    </div>
                )}
            </main>

            {/* Detail Modal overlay with Prev/Next */}
            <AnimatePresence>
                {selectedCard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedCard(null)}
                        />

                        {/* Previous Arrow */}
                        {canGoPrev && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                                className="absolute left-2 sm:left-6 z-20 p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all hover:scale-110 shadow-lg"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Next Arrow */}
                        {canGoNext && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                className="absolute right-2 sm:right-6 z-20 p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all hover:scale-110 shadow-lg"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                        <motion.div
                            key={selectedCard.id}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] z-10"
                        >
                            <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto md:h-full bg-slate-900 shrink-0">
                                <img src={getImageUrl(selectedCard.imageUrl)} alt={selectedCard.name[language]} className="w-full h-full object-cover" />
                            </div>

                            <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto">
                                <div className="mb-4">
                                    {/* Card position indicator */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span style={{ backgroundColor: selectedCard.color + '20', color: selectedCard.color, borderColor: selectedCard.color + '50' }} className="inline-block px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase">
                                            {selectedCard.type[language]}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                            {selectedCardIndex + 1} / {filteredCards.length}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                                        {selectedCard.name[language]}
                                    </h2>
                                    {games.find(g => g.id === selectedCard.gameId) && (
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            From: <span className="text-indigo-600 dark:text-indigo-400">{games.find(g => g.id === selectedCard.gameId)?.name[language]}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-6 mt-8">
                                    <div>
                                        <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 pb-2 border-b border-gray-100 dark:border-slate-800">Card Effect</h4>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-lg">
                                            {selectedCard.effect[language]}
                                        </p>
                                    </div>

                                    {selectedCard.lore && (selectedCard.lore.en || selectedCard.lore.id) && (
                                        <div>
                                            <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 pb-2 border-b border-gray-100 dark:border-slate-800">Lore</h4>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-gray-200 dark:border-slate-700 pl-4 py-1">
                                                "{selectedCard.lore[language]}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Prev/Next Buttons */}
                                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 md:hidden">
                                    <button
                                        onClick={goToPrev}
                                        disabled={!canGoPrev}
                                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Prev
                                    </button>
                                    <button
                                        onClick={goToNext}
                                        disabled={!canGoNext}
                                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

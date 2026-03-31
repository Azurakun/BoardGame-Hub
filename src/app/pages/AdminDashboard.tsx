import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, PlusCircle, LayoutGrid, Layers, BarChart3, Activity, Trash2, List, Grid, Info, Clock, CheckCircle2, Tag, BoxSelect, X, Settings, FileSpreadsheet, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCards } from '../contexts/CardsContext';
import { useGames } from '../contexts/GamesContext';
import { useCategories } from '../contexts/CategoriesContext';
import { Card } from '../data/cards';
import { Game } from '../data/games';

type AdminTab = 'stats' | 'games' | 'cards' | 'logs' | 'categories';
type CardViewMode = 'grid' | 'list';

export function AdminDashboard() {
    const { isAdmin } = useAuth();
    const { language, t } = useLanguage();
    const { cards, addCard, deleteCard } = useCards();
    const { games, addGame, deleteGame } = useGames();
    const { categories, addCategory, deleteCategory } = useCategories();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<AdminTab>('stats');
    const [cardView, setCardView] = useState<CardViewMode>('grid');
    const [cardSearch, setCardSearch] = useState('');
    const [isAddingCard, setIsAddingCard] = useState(false);

    // If not admin, strictly redirect
    if (!isAdmin) {
        navigate('/admin/login');
        return null;
    }

    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editingGameId, setEditingGameId] = useState<string | null>(null);

    // --- CARDS STATE ---
    const [selectedFilterGames, setSelectedFilterGames] = useState<string[]>([]);
    const [selectedFilterTypes, setSelectedFilterTypes] = useState<string[]>([]);
    const [newCard, setNewCard] = useState<Partial<Card>>({
        name: { en: '', id: '' },
        type: { en: '', id: '' },
        effect: { en: '', id: '' },
        lore: { en: '', id: '' },
        gameId: '',
        imageUrl: '',
        color: '#6366f1'
    });
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // --- CATEGORIES STATE ---
    const [newCategoryName, setNewCategoryName] = useState({ en: '', id: '' });
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryTab, setCategoryTab] = useState<'card' | 'wiki' | 'mechanic'>('wiki');

    // --- GAMES STATE ---
    const [isAddingGame, setIsAddingGame] = useState(false);
    const [isUploadingGameImage, setIsUploadingGameImage] = useState(false);
    const [gameSearch, setGameSearch] = useState('');
    const [gameForm, setGameForm] = useState({
        id: '',
        enName: '', idName: '',
        categories: [] as string[],
        enShortDesc: '', idShortDesc: '',
        enDesc: '', idDesc: '',
        minPlayers: 2, maxPlayers: 4,
        playTime: 60, complexity: 2 as 1 | 2 | 3 | 4 | 5,
        designer: '', yearPublished: new Date().getFullYear(),
        mechanics: [] as string[],
        imageUrl: '',
        videoUrl: '',
        enHowToPlay: 'Step 1\nStep 2', idHowToPlay: 'Langkah 1\nLangkah 2',
        rules: [] as { title: { en: string; id: string }; content: { en: string; id: string } }[],
        faq: [] as { q: { en: string; id: string }; a: { en: string; id: string } }[]
    });
    const [wikiSearch, setWikiSearch] = useState('');
    const [wikiFocused, setWikiFocused] = useState(false);
    const [mechanicSearch, setMechanicSearch] = useState('');
    const [mechanicFocused, setMechanicFocused] = useState(false);

    // --- BULK UPLOAD STATE ---
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [bulkUploadType, setBulkUploadType] = useState<'cards' | 'games'>('cards');
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);
    const [bulkImportFormat, setBulkImportFormat] = useState<'json' | 'csv'>('json');

    const uniqueTypes = useMemo(() => {
        const types = new Set<string>();
        cards.forEach(card => types.add(card.type[language]));
        return Array.from(types).sort();
    }, [cards, language]);

    const filteredAdminCards = useMemo(() => {
        return cards.filter(card => {
            const matchesSearch = card.name[language].toLowerCase().includes(cardSearch.toLowerCase());
            const matchesGame = selectedFilterGames.length === 0 || selectedFilterGames.includes(card.gameId);
            const matchesType = selectedFilterTypes.length === 0 || selectedFilterTypes.includes(card.type[language]);
            return matchesGame && matchesType && matchesSearch;
        });
    }, [cards, selectedFilterGames, selectedFilterTypes, cardSearch, language]);

    // Derived states for Games
    const filteredAdminGames = useMemo(() => games.filter(g => {
        if (!gameSearch) return true;
        const query = gameSearch.toLowerCase();
        return g.name.en.toLowerCase().includes(query) || g.name.id.toLowerCase().includes(query);
    }), [games, gameSearch]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setIsUploadingImage(true);
        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setNewCard({ ...newCard, imageUrl: `http://localhost:5000${data.url}` });
            } else {
                console.error('Upload failed:', data.error);
                alert('Image upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Network error during upload.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const openCardEditor = (card: Card) => {
        setEditingCardId(card.id);
        setNewCard(card);
        setIsAddingCard(true);
    };

    const handleGameImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsUploadingGameImage(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setGameForm({ ...gameForm, imageUrl: `http://localhost:5000${data.url}` });
            } else {
                console.error('Upload failed:', data.error);
                alert('Image upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Network error during upload.');
        } finally {
            setIsUploadingGameImage(false);
        }
    };

    const openGameEditor = (game: Game) => {
        setEditingGameId(game.id);
        setGameForm({
            id: game.id,
            enName: game.name.en,
            idName: game.name.id,
            categories: game.category || [],
            enShortDesc: game.shortDescription.en,
            idShortDesc: game.shortDescription.id,
            enDesc: game.description.en,
            idDesc: game.description.id,
            minPlayers: game.minPlayers,
            maxPlayers: game.maxPlayers,
            playTime: game.playTime,
            complexity: game.complexity || 2,
            designer: game.designer || '',
            yearPublished: game.yearPublished || new Date().getFullYear(),
            mechanics: game.mechanics || [],
            imageUrl: game.imageUrl,
            videoUrl: game.videoUrl || '',
            enHowToPlay: game.howToPlay?.en.join('\n') || '',
            idHowToPlay: game.howToPlay?.id.join('\n') || '',
            rules: game.rules?.map(r => ({ title: { en: r.title?.en || '', id: r.title?.id || '' }, content: { en: r.content?.en || '', id: r.content?.id || '' } })) || [],
            faq: game.faq?.map(f => ({ q: { en: f.q?.en || '', id: f.q?.id || '' }, a: { en: f.a?.en || '', id: f.a?.id || '' } })) || []
        });
        setIsAddingGame(true);
    };

    // --- CSV HELPERS ---
    const parseCsvRow = (row: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const ch = row[i];
            if (ch === '"') {
                if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
                else { inQuotes = !inQuotes; }
            } else if (ch === ',' && !inQuotes) {
                result.push(current); current = '';
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result.map(s => s.trim());
    };

    const downloadCsvTemplate = () => {
        const headers = ['gameId','name_en','name_id','type_en','type_id','effect_en','effect_id','lore_en','lore_id','imageUrl','color'];
        const example = [
            'here-to-slay',
            'Example Card',
            'Kartu Contoh',
            'Fighter Hero',
            'Pahlawan Petarung',
            'Draw 2 cards from the deck.',
            'Ambil 2 kartu dari dek.',
            'A legendary hero of old.',
            'Pahlawan legendaris masa lalu.',
            'https://placehold.co/400x600/1e1b4b/e0e7ff.png?text=Card',
            '#6366f1'
        ];
        const csvContent = [headers.join(','), example.map(v => `"${v.replace(/"/g, '""')}"`).join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'cards_template.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessingBulk(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
                if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');
                const headers = parseCsvRow(lines[0]).map(h => h.toLowerCase());
                const idx = (col: string) => headers.indexOf(col);
                let successCount = 0;
                let errorCount = 0;
                for (let i = 1; i < lines.length; i++) {
                    const cols = parseCsvRow(lines[i]);
                    if (cols.length < 2) continue;
                    const get = (col: string) => { const j = idx(col); return j >= 0 ? cols[j] || '' : ''; };
                    const nameEn = get('name_en') || get('name');
                    const effectEn = get('effect_en') || get('effect');
                    const typeEn = get('type_en') || get('type');
                    const gameId = get('gameid') || get('game_id');
                    if (!nameEn || !effectEn || !typeEn || !gameId) {
                        console.warn(`Row ${i + 1} skipped — missing required fields (gameId, name_en, type_en, effect_en).`);
                        errorCount++; continue;
                    }
                    try {
                        const cardToAdd: Omit<Card, 'id'> = {
                            gameId,
                            name: { en: nameEn, id: get('name_id') || nameEn },
                            type: { en: typeEn, id: get('type_id') || typeEn },
                            effect: { en: effectEn, id: get('effect_id') || effectEn },
                            lore: { en: get('lore_en'), id: get('lore_id') || get('lore_en') },
                            imageUrl: get('imageurl') || get('image_url') || 'https://placehold.co/400x600/1e1b4b/e0e7ff.png?text=New+Card',
                            color: get('color') || '#6366f1'
                        };
                        await addCard(cardToAdd);
                        successCount++;
                    } catch (err) {
                        console.error(`Failed adding CSV row ${i + 1}:`, err);
                        errorCount++;
                    }
                }
                alert(`CSV Import done!\n✅ ${successCount} card(s) imported.${errorCount > 0 ? `\n⚠️ ${errorCount} row(s) skipped (see console for details).` : ''}`);
                setIsBulkUploadModalOpen(false);
            } catch (error: any) {
                console.error('CSV Parse Error:', error);
                alert(`Error reading CSV: ${error.message}`);
            } finally {
                setIsProcessingBulk(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessingBulk(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const jsonData = JSON.parse(text);

                if (!Array.isArray(jsonData)) {
                    throw new Error("Invalid format. Expected a JSON array.");
                }

                if (bulkUploadType === 'cards') {
                    for (const item of jsonData) {
                        try {
                            const newCard: Omit<Card, 'id'> = {
                                name: item.name || { en: 'Unknown', id: 'Tidak Diketahui' },
                                type: item.type || { en: 'General', id: 'Umum' },
                                effect: item.effect || { en: '', id: '' },
                                lore: item.lore || { en: '', id: '' },
                                imageUrl: item.imageUrl || 'https://placehold.co/400x600/1e1b4b/e0e7ff.png?text=New+Card',
                                gameId: item.gameId || '',
                                color: item.color || '#6366f1'
                            };
                            await addCard(newCard);
                        } catch (err) {
                            console.error("Failed adding a bulk card:", err);
                        }
                    }
                } else if (bulkUploadType === 'games') {
                    for (const item of jsonData) {
                        try {
                            const newGame: Game = {
                                id: item.id || `game-${Date.now()}-${Math.random()}`,
                                name: item.name || { en: 'New Game', id: 'Game Baru' },
                                category: item.category || item.categories || [],
                                shortDescription: item.shortDescription || { en: '', id: '' },
                                description: item.description || { en: '', id: '' },
                                minPlayers: item.minPlayers || 1,
                                maxPlayers: item.maxPlayers || 4,
                                playTime: item.playTime || 30,
                                complexity: item.complexity || 1,
                                imageUrl: item.imageUrl || 'https://placehold.co/800x600/1e1b4b/e0e7ff.png?text=New+Game',
                                howToPlay: item.howToPlay || { en: ['Play!'], id: ['Main!'] },
                                designer: item.designer || 'Unknown',
                                yearPublished: item.yearPublished || new Date().getFullYear(),
                                mechanics: item.mechanics || [],
                                rules: item.rules || []
                            };
                            await addGame(newGame);
                        } catch (err) {
                            console.error("Failed adding a bulk game:", err);
                        }
                    }
                }

                alert(`Successfully bulk-imported ${jsonData.length} items!`);
                setIsBulkUploadModalOpen(false);
            } catch (error: any) {
                console.error('JSON Parse Error:', error);
                alert(`Error reading JSON file: ${error.message}`);
            } finally {
                setIsProcessingBulk(false);
                if (e.target) e.target.value = ''; // Reset input
            }
        };

        reader.readAsText(file);
    };

    const closeCardModal = () => {
        setIsAddingCard(false);
        setEditingCardId(null);
        setNewCard({
            name: { en: '', id: '' }, type: { en: '', id: '' },
            effect: { en: '', id: '' }, lore: { en: '', id: '' },
            imageUrl: '', gameId: '', color: '#6366f1'
        });
    };

    const closeGameModal = () => {
        setIsAddingGame(false);
        setEditingGameId(null);
        setGameForm({
            id: '', enName: '', idName: '', categories: [], enShortDesc: '', idShortDesc: '',
            enDesc: '', idDesc: '', minPlayers: 2, maxPlayers: 4, playTime: 60, complexity: 2,
            designer: '', yearPublished: new Date().getFullYear(), mechanics: [], imageUrl: '',
            videoUrl: '',
            enHowToPlay: 'Step 1\nStep 2', idHowToPlay: '', rules: [], faq: []
        });
    };

    const handleCardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validation
        if (!newCard.name?.en?.trim()) return alert("Card Name (EN) is required!");
        if (!newCard.type?.en?.trim()) return alert("Card Type (EN) is required! Please select Categories.");
        if (!newCard.effect?.en?.trim()) return alert("Card Effect (EN) is required!");
        if (!newCard.gameId?.trim()) return alert("Target Game is required!");

        const safeEnName = newCard.name.en.trim();
        const safeEnType = newCard.type.en.trim();
        const safeEnEffect = newCard.effect?.en?.trim() || '';
        const safeEnLore = newCard.lore?.en?.trim() || '';

        const cardToAdd: Omit<Card, 'id'> = {
            name: { en: safeEnName, id: newCard.name?.id?.trim() || safeEnName },
            type: { en: safeEnType, id: newCard.type?.id?.trim() || safeEnType },
            effect: { en: safeEnEffect, id: newCard.effect?.id?.trim() || safeEnEffect },
            lore: { en: safeEnLore, id: newCard.lore?.id?.trim() || safeEnLore },
            imageUrl: newCard.imageUrl || 'https://placehold.co/400x600/1e1b4b/e0e7ff.png?text=New+Card',
            gameId: newCard.gameId,
            color: newCard.color || '#6366f1'
        };

        let success = false;
        if (editingCardId) {
            // @ts-ignore - updateCard injected
            if (typeof window !== 'undefined' && window.updateCard) {
                // @ts-ignore
                success = await window.updateCard(editingCardId, cardToAdd);
            }
        } else {
            success = await addCard(cardToAdd);
        }

        if (success) {
            alert(editingCardId ? "Card Updated Successfully!" : "Card Published Successfully!");
            closeCardModal();
        } else {
            alert("Database rejected payload. Ensure required schema parameters are met.");
        }
    };

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addCategory({ id: '', name: newCategoryName, type: categoryTab });
        setNewCategoryName({ en: '', id: '' });
        setIsAddingCategory(false);
    };

    const toggleCardCategory = (catEn: string, catId: string) => {
        const currentEn = newCard.type?.en ? newCard.type.en.split(', ') : [];
        const currentId = newCard.type?.id ? newCard.type.id.split(', ') : [];

        if (currentEn.includes(catEn)) {
            setNewCard({
                ...newCard,
                type: {
                    en: currentEn.filter(c => c !== catEn).join(', '),
                    id: currentId.filter(c => c !== catId).join(', ')
                }
            });
        } else {
            setNewCard({
                ...newCard,
                type: {
                    en: [...currentEn, catEn].join(', '),
                    id: [...currentId, catId].join(', ')
                }
            });
        }
    };

    const handleGameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gameForm.enName.trim()) return alert("Game Name (EN) is Required!");
        if (!gameForm.enShortDesc.trim() || !gameForm.enDesc.trim()) return alert("English Game Descriptions are Required!");
        if (gameForm.categories.length === 0) return alert("You must provide at least one Tag & Category.");

        const safeID = gameForm.enName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const safeEnHowToPlay = gameForm.enHowToPlay.split('\n').filter(s => s.trim() !== '');
        const safeIdHowToPlay = gameForm.idHowToPlay.trim() ? gameForm.idHowToPlay.split('\n').filter(s => s.trim() !== '') : safeEnHowToPlay;

        const newGame: Game = {
            id: gameForm.id || safeID,
            name: { en: gameForm.enName.trim(), id: gameForm.idName.trim() || gameForm.enName.trim() },
            category: gameForm.categories,
            shortDescription: { en: gameForm.enShortDesc.trim(), id: gameForm.idShortDesc.trim() || gameForm.enShortDesc.trim() },
            description: { en: gameForm.enDesc.trim(), id: gameForm.idDesc.trim() || gameForm.enDesc.trim() },
            minPlayers: gameForm.minPlayers,
            maxPlayers: gameForm.maxPlayers,
            playTime: gameForm.playTime,
            complexity: gameForm.complexity,
            designer: gameForm.designer,
            yearPublished: gameForm.yearPublished,
            mechanics: gameForm.mechanics,
            imageUrl: gameForm.imageUrl || 'https://placehold.co/800x600/1e293b/f8fafc.png?text=New+Game',
            videoUrl: gameForm.videoUrl || '',
            howToPlay: { en: safeEnHowToPlay, id: safeIdHowToPlay },
            rules: gameForm.rules.map(r => ({
                title: { en: r.title.en, id: r.title.id || r.title.en },
                content: { en: r.content.en, id: r.content.id || r.content.en }
            })),
            faq: gameForm.faq.map(f => ({
                q: { en: f.q.en, id: f.q.id || f.q.en },
                a: { en: f.a.en, id: f.a.id || f.a.en }
            }))
        };

        let success = false;
        if (editingGameId) {
            // @ts-ignore - updateGame injected
            if (typeof window !== 'undefined' && window.updateGame) {
                // @ts-ignore
                success = await window.updateGame(editingGameId, newGame);
            }
        } else {
            success = await addGame(newGame);
        }

        if (success) {
            alert(editingGameId ? "Wiki Entry Updated Successfully!" : "Wiki Entry Published Successfully!");
            closeGameModal();
        } else {
            alert("Database rejected payload. Ensure required schema parameters are met.");
        }
    };

    const navItems = [
        { id: 'stats', label: 'Overview & Stats', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'cards', label: 'Manage Cards', icon: <Layers className="w-5 h-5" /> },
        { id: 'categories', label: 'Manage Categories', icon: <Tag className="w-5 h-5" /> },
        { id: 'games', label: 'Manage Games', icon: <LayoutGrid className="w-5 h-5" /> },
        { id: 'logs', label: 'Activity Logs', icon: <Activity className="w-5 h-5" /> },
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0B1120]">
            {/* Left Sidebar Navigation */}
            <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col gap-8 flex-shrink-0">
                <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Admin<br />Console</h2>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as AdminTab)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === item.id
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 md:overflow-y-auto">
                <AnimatePresence mode="wait">

                    {/* STATS VIEW */}
                    {activeTab === 'stats' && (
                        <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Platform Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">Total Cards</p>
                                        <h3 className="text-4xl font-black text-gray-900 dark:text-white">{cards.length}</h3>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <LayoutGrid className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">Registered Games</p>
                                        <h3 className="text-4xl font-black text-gray-900 dark:text-white">{games.length}</h3>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Activity className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">Server Status</p>
                                        <h3 className="text-2xl font-black text-emerald-500">Connected</h3>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* LOGS VIEW */}
                    {activeTab === 'logs' && (
                        <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6">System Activity Logs</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {[
                                        { action: "Database Seed Initialized", time: "10 mins ago", type: 'system' },
                                        { action: `Admin fetched ${cards.length} cards from server`, time: "Just now", type: 'read' },
                                        { action: `Admin logged in successfully`, time: "5 mins ago", type: 'auth' }
                                    ].map((log, i) => (
                                        <li key={i} className="p-6 flex items-start gap-4">
                                            <div className="mt-1">
                                                {log.type === 'system' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                                {log.type === 'read' && <Info className="w-5 h-5 text-blue-500" />}
                                                {log.type === 'auth' && <ShieldCheck className="w-5 h-5 text-indigo-500" />}
                                            </div>
                                            <div>
                                                <p className="text-gray-900 dark:text-white font-medium">{log.action}</p>
                                                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1"><Clock className="w-3 h-3" /> {log.time}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {/* CATEGORIES VIEW */}
                    {activeTab === 'categories' && (
                        <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Manage Categories</h2>
                                <button onClick={() => setIsAddingCategory(!isAddingCategory)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                                    <PlusCircle className="w-5 h-5" /> {isAddingCategory ? 'Cancel' : 'Add Category'}
                                </button>
                            </div>

                            {/* TYPE FILTER MENU */}
                            <div className="flex px-1 space-x-2 border-b border-gray-200 dark:border-slate-800 pb-2">
                                <button onClick={() => setCategoryTab('wiki')} className={`px-4 py-2 font-bold text-sm rounded-t-xl transition-all ${categoryTab === 'wiki' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Wiki Attributes</button>
                                <button onClick={() => setCategoryTab('mechanic')} className={`px-4 py-2 font-bold text-sm rounded-t-xl transition-all ${categoryTab === 'mechanic' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Game Mechanics</button>
                                <button onClick={() => setCategoryTab('card')} className={`px-4 py-2 font-bold text-sm rounded-t-xl transition-all ${categoryTab === 'card' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Card Types</button>
                            </div>

                            <AnimatePresence>
                                {isAddingCategory && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4 mt-4">
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">New <span className="uppercase text-indigo-500">{categoryTab}</span> Name</h3>
                                            <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input required type="text" placeholder="EN Tag..." value={newCategoryName.en} onChange={e => setNewCategoryName({ ...newCategoryName, en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2" />
                                                <input required type="text" placeholder="ID Tag..." value={newCategoryName.id} onChange={e => setNewCategoryName({ ...newCategoryName, id: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2" />
                                                <div className="md:col-span-2 pt-2">
                                                    <button type="submit" className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md">Create Tag</button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mt-4">
                                <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {categories.filter((c: any) => c.type === categoryTab || (!c.type && categoryTab === 'card')).length === 0 ? (
                                        <li className="p-8 text-center text-gray-500">No tags exist in this filter.</li>
                                    ) : categories.filter((c: any) => c.type === categoryTab || (!c.type && categoryTab === 'card')).map((cat: any) => (
                                        <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{cat.name.en}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{cat.name.id}</p>
                                            </div>
                                            <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {/* CARDS VIEW */}
                    {activeTab === 'cards' && (
                        <motion.div key="cards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Card Database Directory</h2>
                                <button onClick={() => setIsAddingCard(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                                    <PlusCircle className="w-5 h-5" /> Add New Card
                                </button>
                            </div>

                            {/* ADD CARD MODAL FORM */}
                            <AnimatePresence>
                                {isAddingCard && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isCategoryModalOpen && closeCardModal()} />
                                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 rounded-t-2xl">
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white">{editingCardId ? 'Edit Card Entry' : 'Create New Card Entry'}</h3>
                                                <button type="button" onClick={closeCardModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                                            </div>
                                            <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">
                                                <form onSubmit={handleCardSubmit} className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name (EN) *</label><input placeholder="e.g. The Mighty Dragon" required type="text" value={newCard.name?.en || ''} onChange={e => setNewCard({ ...newCard, name: { ...newCard.name!, en: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                                                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name (ID) *</label><input placeholder="e.g. Naga Perkasa" required type="text" value={newCard.name?.id || ''} onChange={e => setNewCard({ ...newCard, name: { ...newCard.name!, id: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                                                        <div className="space-y-2 md:col-span-2">
                                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Card Type / Categories *</label>
                                                            <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-left hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                                                <span className="text-gray-900 dark:text-white font-medium break-words">
                                                                    {newCard.type?.en ? newCard.type.en : <span className="text-gray-400">Select Categories...</span>}
                                                                </span>
                                                                <BoxSelect className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Effect (EN) *</label><textarea placeholder="e.g. Discard 2 cards to draw 3." required rows={2} value={newCard.effect?.en || ''} onChange={e => setNewCard({ ...newCard, effect: { ...newCard.effect!, en: e.target.value } })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none resize-none" /></div>
                                                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Effect (ID) *</label><textarea placeholder="e.g. Buang 2 kartu untuk mengambil 3." required rows={2} value={newCard.effect?.id || ''} onChange={e => setNewCard({ ...newCard, effect: { ...newCard.effect!, id: e.target.value } })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none resize-none" /></div>
                                                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lore (EN)</label><textarea placeholder="e.g. It slumbered for a thousand years..." rows={2} value={newCard.lore?.en || ''} onChange={e => setNewCard({ ...newCard, lore: { ...newCard.lore!, en: e.target.value } })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none resize-none" /></div>
                                                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lore (ID)</label><textarea placeholder="e.g. Ia tertidur selama seribu tahun..." rows={2} value={newCard.lore?.id || ''} onChange={e => setNewCard({ ...newCard, lore: { ...newCard.lore!, id: e.target.value } })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none resize-none" /></div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target Game *</label>
                                                            <select required value={newCard.gameId || ''} onChange={e => setNewCard({ ...newCard, gameId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer">
                                                                <option value="" disabled>Select Target Game</option>
                                                                {games.map(g => <option key={g.id} value={g.id}>{g.name[language]}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Card Color Theme *</label><input type="color" value={newCard.color || '#6366f1'} onChange={e => setNewCard({ ...newCard, color: e.target.value })} className="w-full h-12 p-1 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 cursor-pointer object-cover" /></div>
                                                        <div className="space-y-2 md:col-span-2">
                                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Card Artwork (Upload or Paste URL)</label>
                                                            <div className="flex flex-col gap-3 sm:flex-row items-center">
                                                                <input type="text" value={newCard.imageUrl || ''} onChange={e => setNewCard({ ...newCard, imageUrl: e.target.value })} className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="https://" />
                                                                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">OR</span>
                                                                <label className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all border shrink-0 ${isUploadingImage ? 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'}`}>
                                                                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                                                </label>
                                                            </div>
                                                            {newCard.imageUrl && <div className="mt-2 text-xs text-indigo-500 truncate">{newCard.imageUrl}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800 mt-6">
                                                        <button type="button" onClick={closeCardModal} className="px-6 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                                        <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5">{editingCardId ? 'Update Card' : 'Publish Card'}</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </motion.div>

                                        {/* CATEGORY SELECTOR MODAL */}
                                        <AnimatePresence>
                                            {isCategoryModalOpen && (
                                                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
                                                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                                                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Assign Categories</h3>
                                                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
                                                        </div>
                                                        <div className="p-5 overflow-y-auto flex-1 space-y-2">
                                                            {categories.length === 0 ? (
                                                                <p className="text-center text-sm text-gray-500 py-4">No categories created yet.</p>
                                                            ) : (
                                                                categories.map(cat => {
                                                                    const isChecked = newCard.type?.en?.split(', ').includes(cat.name.en) ?? false;
                                                                    return (
                                                                        <label key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' : 'bg-white border-gray-100 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'}`}>
                                                                            <input type="checkbox" checked={isChecked} onChange={() => toggleCardCategory(cat.name.en, cat.name.id)} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700" />
                                                                            <span className="font-medium text-gray-900 dark:text-white">{cat.name.en} <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">({cat.name.id})</span></span>
                                                                        </label>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                        <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                                                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700">Done</button>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </AnimatePresence>

                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* ADMIN FILTERS SIDEBAR */}
                                <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 h-fit sticky top-24">
                                    <div className="mb-6">
                                        <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Target Game</h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {games.map(game => (
                                                <label key={game.id} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox" checked={selectedFilterGames.includes(game.id)}
                                                        onChange={() => setSelectedFilterGames((p: string[]) => p.includes(game.id) ? p.filter((x: string) => x !== game.id) : [...p, game.id])}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">{game.name[language]}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Card Type</h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {uniqueTypes.map((type: string) => (
                                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox" checked={selectedFilterTypes.includes(type)}
                                                        onChange={() => setSelectedFilterTypes((p: string[]) => p.includes(type) ? p.filter((x: string) => x !== type) : [...p, type])}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors uppercase">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">View Modes</h3>
                                        <div className="bg-gray-100 dark:bg-slate-900 p-1 rounded-lg flex border border-gray-200 dark:border-slate-700">
                                            <button onClick={() => setCardView('grid')} className={`flex-1 flex justify-center py-2 rounded-md transition-all ${cardView === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Grid className="w-4 h-4" /></button>
                                            <button onClick={() => setCardView('list')} className={`flex-1 flex justify-center py-2 rounded-md transition-all ${cardView === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><List className="w-4 h-4" /></button>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
                                            <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Bulk Data</h3>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => { setBulkUploadType('cards'); setBulkImportFormat('json'); setIsBulkUploadModalOpen(true); }} className="w-full flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors font-medium text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-4 h-4" />
                                                        <span>Import JSON</span>
                                                    </div>
                                                    <PlusCircle className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => { setBulkUploadType('cards'); setBulkImportFormat('csv'); setIsBulkUploadModalOpen(true); }} className="w-full flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors font-medium text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <FileSpreadsheet className="w-4 h-4" />
                                                        <span>Import CSV</span>
                                                    </div>
                                                    <PlusCircle className="w-3 h-3" />
                                                </button>
                                                <button onClick={downloadCsvTemplate} className="w-full flex items-center justify-between px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors font-medium text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Download className="w-4 h-4" />
                                                        <span>Template CSV</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </aside>

                                {/* ACTIVE CARDS GALLERY */}
                                <div className="flex-1">
                                    <div className="mb-4">
                                        <input
                                            type="text" placeholder="Search cards by name..."
                                            value={cardSearch} onChange={(e) => setCardSearch(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        />
                                    </div>

                                    {filteredAdminCards.length === 0 ? (
                                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                                            <Layers className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">Database is empty or no filters matched.</p>
                                        </div>
                                    ) : (
                                        <div className={cardView === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" : "flex flex-col gap-3"}>
                                            <AnimatePresence>
                                                {filteredAdminCards.map((card: any) => (
                                                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={card.id} className={`group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:border-indigo-500/30 transition-all ${cardView === 'list' ? 'flex flex-row items-center p-3 gap-4' : 'flex flex-col'}`}>
                                                        {cardView === 'grid' && (
                                                            <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-slate-900 relative">
                                                                <img src={card.imageUrl} alt={card.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                                    <button onClick={() => openCardEditor(card)} className="p-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 shadow-md transform hover:scale-110"><Settings className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={() => deleteCard(card.id)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-md transform hover:scale-110"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {cardView === 'list' && (
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-900 group-hover:shadow-md transition-shadow relative">
                                                                <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div className={`flex-1 flex flex-col ${cardView === 'grid' ? 'p-3' : 'overflow-hidden'}`}>
                                                            <div className="flex justify-between items-start">
                                                                <div className="overflow-hidden pr-2">
                                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 truncate">{card.name[language]}</h4>
                                                                    {cardView === 'grid' && <span style={{ backgroundColor: card.color + '20', color: card.color }} className="text-[10px] font-bold px-1.5 py-0.5 mt-1 rounded inline-block capitalize truncate">{card.type[language]}</span>}
                                                                </div>
                                                                {cardView === 'list' && (
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => openCardEditor(card)} className="p-1.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-md transition-colors shrink-0"><Settings className="w-4 h-4" /></button>
                                                                        <button onClick={() => deleteCard(card.id)} className="p-1.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {cardView === 'list' && (
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span style={{ backgroundColor: card.color + '20', color: card.color }} className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize">{card.type[language]}</span>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex-1">{card.effect[language]}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* GAMES VIEW */}
                    {activeTab === 'games' && (
                        <motion.div key="games" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Wiki & Game Registry</h2>
                                <div className="flex gap-3">
                                    <button onClick={() => { setBulkUploadType('games'); setIsBulkUploadModalOpen(true); }} className="px-5 py-2.5 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                                        <Layers className="w-5 h-5" /> Import JSON
                                    </button>
                                    <button onClick={() => setIsAddingGame(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                                        <PlusCircle className="w-5 h-5" /> Add New Wiki Entry
                                    </button>
                                </div>
                            </div>

                            {/* ADD GAME MODAL FORM */}
                            <AnimatePresence>
                                {isAddingGame && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeGameModal} />
                                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 rounded-t-2xl">
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white">{editingGameId ? 'Edit Wiki Entry' : 'Create New Wiki Entry'}</h3>
                                                <button type="button" onClick={closeGameModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                                            </div>
                                            <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">
                                                <form onSubmit={handleGameSubmit} className="space-y-8">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">System ID</label><input placeholder="e.g. ticket-to-ride" type="text" value={gameForm.id} onChange={e => setGameForm({ ...gameForm, id: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                                                            <div className="space-y-2 md:col-span-1">
                                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Cover Image (Upload or Paste URL)</label>
                                                                <div className="flex flex-col gap-2 sm:flex-row items-center">
                                                                    <input type="text" placeholder="https://" value={gameForm.imageUrl} onChange={e => setGameForm({ ...gameForm, imageUrl: e.target.value })} className="w-full flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                                                    <span className="text-gray-500 dark:text-gray-400 font-medium text-xs hidden sm:block">OR</span>
                                                                    <label className={`cursor-pointer px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all border shrink-0 text-center w-full sm:w-auto ${isUploadingGameImage ? 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'}`}>
                                                                        {isUploadingGameImage ? 'Uploading...' : 'Upload File'}
                                                                        <input type="file" accept="image/*" className="hidden" onChange={handleGameImageUpload} disabled={isUploadingGameImage} />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Game Name (EN) *</label><input placeholder="e.g. Ticket to Ride" required type="text" value={gameForm.enName} onChange={e => setGameForm({ ...gameForm, enName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Game Name (ID) *</label><input placeholder="e.g. Tiket Kereta Berpetualang" required type="text" value={gameForm.idName} onChange={e => setGameForm({ ...gameForm, idName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                                                            <div className="space-y-2 md:col-span-2 relative">
                                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags & Categories</label>
                                                                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl min-h-[50px] items-center">
                                                                    {gameForm.categories.map((cat, i) => (
                                                                        <span key={i} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                                                            {cat}
                                                                            <button type="button" onClick={() => setGameForm({ ...gameForm, categories: gameForm.categories.filter((_, index) => index !== i) })} className="hover:text-red-500 transition-colors bg-white/50 dark:bg-black/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                                                        </span>
                                                                    ))}
                                                                    <div className="flex-1 relative min-w-[200px]">
                                                                        <input type="text" placeholder="Search or Create Category..." value={wikiSearch} onChange={(e) => setWikiSearch(e.target.value)} onFocus={() => setWikiFocused(true)} onBlur={() => setTimeout(() => setWikiFocused(false), 200)} className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white dark:placeholder-slate-500" />
                                                                        <AnimatePresence>
                                                                            {wikiFocused && (
                                                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute left-0 top-full mt-2 w-full z-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto overflow-x-hidden">
                                                                                    {categories.filter(c => c.type === 'wiki' && c.name.en.toLowerCase().includes(wikiSearch.toLowerCase()) && !gameForm.categories.includes(c.name.en)).map(cat => (
                                                                                        <button key={cat.id} type="button" onClick={() => { setGameForm(p => ({ ...p, categories: [...p.categories, cat.name.en] })); setWikiSearch(''); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors truncate">
                                                                                            {cat.name.en} <span className="text-xs text-gray-400">({cat.name.id})</span>
                                                                                        </button>
                                                                                    ))}
                                                                                    {wikiSearch.trim() && !categories.some(c => c.type === 'wiki' && c.name.en.toLowerCase() === wikiSearch.trim().toLowerCase()) && (
                                                                                        <button type="button" onClick={() => { addCategory({ id: '', name: { en: wikiSearch.trim(), id: wikiSearch.trim() }, type: 'wiki' }); setGameForm(p => ({ ...p, categories: [...p.categories, wikiSearch.trim()] })); setWikiSearch(''); }} className="w-full text-left px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-100 dark:border-slate-700 truncate">
                                                                                            <PlusCircle className="inline w-4 h-4 mr-1" /> Create "{wikiSearch.trim()}"
                                                                                        </button>
                                                                                    )}
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Content & Descriptions</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Short Summary (EN) *</label><textarea placeholder="e.g. A fast-paced train adventure." required rows={2} value={gameForm.enShortDesc} onChange={e => setGameForm({ ...gameForm, enShortDesc: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" /></div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Short Summary (ID) *</label><textarea placeholder="e.g. Petualangan kereta cepat melintasi benua." required rows={2} value={gameForm.idShortDesc} onChange={e => setGameForm({ ...gameForm, idShortDesc: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" /></div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Description (EN) *</label><textarea placeholder="e.g. Build your tracks across North America..." required rows={4} value={gameForm.enDesc} onChange={e => setGameForm({ ...gameForm, enDesc: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" /></div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Description (ID) *</label><textarea placeholder="e.g. Bangun rute kereta api Anda..." required rows={4} value={gameForm.idDesc} onChange={e => setGameForm({ ...gameForm, idDesc: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" /></div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Metadata & Mechanics</h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Min Players</label><input placeholder="e.g. 2" required type="number" value={gameForm.minPlayers} onChange={e => setGameForm({ ...gameForm, minPlayers: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max Players</label><input placeholder="e.g. 5" required type="number" value={gameForm.maxPlayers} onChange={e => setGameForm({ ...gameForm, maxPlayers: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time (mins)</label><input placeholder="e.g. 60" required type="number" value={gameForm.playTime} onChange={e => setGameForm({ ...gameForm, playTime: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weight (1-5)</label>
                                                                <select required value={gameForm.complexity} onChange={e => setGameForm({ ...gameForm, complexity: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer">
                                                                    <option value={1}>1 - Very Light</option>
                                                                    <option value={2}>2 - Light</option>
                                                                    <option value={3}>3 - Medium</option>
                                                                    <option value={4}>4 - Heavy</option>
                                                                    <option value={5}>5 - Very Heavy</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-2 md:col-span-4 mt-2 relative">
                                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mechanics</label>
                                                                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl min-h-[50px] items-center">
                                                                    {gameForm.mechanics.map((mech, i) => (
                                                                        <span key={i} className="bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                                                            {mech}
                                                                            <button type="button" onClick={() => setGameForm({ ...gameForm, mechanics: gameForm.mechanics.filter((_, index) => index !== i) })} className="hover:text-red-500 transition-colors bg-white/50 dark:bg-black/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                                                        </span>
                                                                    ))}
                                                                    <div className="flex-1 relative min-w-[200px]">
                                                                        <input type="text" placeholder="Search or Create Mechanic..." value={mechanicSearch} onChange={(e) => setMechanicSearch(e.target.value)} onFocus={() => setMechanicFocused(true)} onBlur={() => setTimeout(() => setMechanicFocused(false), 200)} className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white dark:placeholder-slate-500" />
                                                                        <AnimatePresence>
                                                                            {mechanicFocused && (
                                                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute left-0 top-full mt-2 w-full z-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto overflow-x-hidden">
                                                                                    {categories.filter(c => c.type === 'mechanic' && c.name.en.toLowerCase().includes(mechanicSearch.toLowerCase()) && !gameForm.mechanics.includes(c.name.en)).map(cat => (
                                                                                        <button key={cat.id} type="button" onClick={() => { setGameForm(p => ({ ...p, mechanics: [...p.mechanics, cat.name.en] })); setMechanicSearch(''); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors truncate">
                                                                                            {cat.name.en} <span className="text-xs text-gray-400">({cat.name.id})</span>
                                                                                        </button>
                                                                                    ))}
                                                                                    {mechanicSearch.trim() && !categories.some(c => c.type === 'mechanic' && c.name.en.toLowerCase() === mechanicSearch.trim().toLowerCase()) && (
                                                                                        <button type="button" onClick={() => { addCategory({ id: '', name: { en: mechanicSearch.trim(), id: mechanicSearch.trim() }, type: 'mechanic' }); setGameForm(p => ({ ...p, mechanics: [...p.mechanics, mechanicSearch.trim()] })); setMechanicSearch(''); }} className="w-full text-left px-4 py-3 text-sm text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-100 dark:border-slate-700 truncate">
                                                                                            <PlusCircle className="inline w-4 h-4 mr-1" /> Create "{mechanicSearch.trim()}"
                                                                                        </button>
                                                                                    )}
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How To Play Sequence</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Steps (EN)</label><textarea placeholder="Step 1: Each player draws 4 cards...&#10;Step 2: Start mapping..." required rows={5} value={gameForm.enHowToPlay} onChange={e => setGameForm({ ...gameForm, enHowToPlay: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" /></div>
                                                            <div className="space-y-2"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Steps (ID)</label><textarea placeholder="Langkah 1: Setiap pemain mengambil 4 kartu...&#10;Langkah 2: Mulai menyusun rute..." required rows={5} value={gameForm.idHowToPlay} onChange={e => setGameForm({ ...gameForm, idHowToPlay: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" /></div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Rules Sections</h3>
                                                            <button type="button" onClick={() => setGameForm({ ...gameForm, rules: [...gameForm.rules, { title: { en: '', id: '' }, content: { en: '', id: '' } }] })} className="px-3 py-1.5 text-sm bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"><PlusCircle className="w-4 h-4" /> Add Section</button>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {gameForm.rules.map((rule, idx) => (
                                                                <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 relative group shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
                                                                    <button type="button" onClick={() => setGameForm({ ...gameForm, rules: gameForm.rules.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pr-12">
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Section Title (EN)</label><input type="text" placeholder="e.g. Setup phase" value={rule.title.en} onChange={e => { const newRules = [...gameForm.rules]; newRules[idx].title.en = e.target.value; setGameForm({ ...gameForm, rules: newRules }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-emerald-500/50" /></div>
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Section Title (ID)</label><input type="text" placeholder="e.g. Fase persiapan" value={rule.title.id} onChange={e => { const newRules = [...gameForm.rules]; newRules[idx].title.id = e.target.value; setGameForm({ ...gameForm, rules: newRules }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-emerald-500/50" /></div>
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Content (EN)</label><textarea placeholder="Explain the rules..." rows={3} value={rule.content.en} onChange={e => { const newRules = [...gameForm.rules]; newRules[idx].content.en = e.target.value; setGameForm({ ...gameForm, rules: newRules }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-emerald-500/50 resize-y min-h-[80px]" /></div>
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Content (ID)</label><textarea placeholder="Jelaskan peraturannya..." rows={3} value={rule.content.id} onChange={e => { const newRules = [...gameForm.rules]; newRules[idx].content.id = e.target.value; setGameForm({ ...gameForm, rules: newRules }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-emerald-500/50 resize-y min-h-[80px]" /></div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {gameForm.rules.length === 0 && <div className="text-sm font-medium text-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/30">No extra rule sections added. Click 'Add Section' to begin.</div>}
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Frequently Asked Questions (FAQ)</h3>
                                                            <button type="button" onClick={() => setGameForm({ ...gameForm, faq: [...gameForm.faq, { q: { en: '', id: '' }, a: { en: '', id: '' } }] })} className="px-3 py-1.5 text-sm bg-indigo-100/50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold rounded-lg flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"><PlusCircle className="w-4 h-4" /> Add FAQ Item</button>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {gameForm.faq.map((faq, idx) => (
                                                                <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 relative group shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                                                                    <button type="button" onClick={() => setGameForm({ ...gameForm, faq: gameForm.faq.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pr-12">
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Question (EN)</label><input type="text" placeholder="e.g. Can I draw 2 wild cards?" value={faq.q.en} onChange={e => { const newFaq = [...gameForm.faq]; newFaq[idx].q.en = e.target.value; setGameForm({ ...gameForm, faq: newFaq }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-indigo-500/50" /></div>
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Question (ID)</label><input type="text" placeholder="e.g. Bisakah saya ambil 2 kartu wild?" value={faq.q.id} onChange={e => { const newFaq = [...gameForm.faq]; newFaq[idx].q.id = e.target.value; setGameForm({ ...gameForm, faq: newFaq }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-indigo-500/50" /></div>
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Answer (EN)</label><textarea placeholder="No, you can only draw..." rows={2} value={faq.a.en} onChange={e => { const newFaq = [...gameForm.faq]; newFaq[idx].a.en = e.target.value; setGameForm({ ...gameForm, faq: newFaq }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-indigo-500/50 resize-y min-h-[60px]" /></div>
                                                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Answer (ID)</label><textarea placeholder="Tidak, Anda hanya boleh..." rows={2} value={faq.a.id} onChange={e => { const newFaq = [...gameForm.faq]; newFaq[idx].a.id = e.target.value; setGameForm({ ...gameForm, faq: newFaq }); }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none focus:border-indigo-500/50 resize-y min-h-[60px]" /></div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {gameForm.faq.length === 0 && <div className="text-sm font-medium text-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/30">No FAQs mapped. Click 'Add FAQ Item' to expand context.</div>}
                                                        </div>
                                                    </div>
                                                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">YouTube Video</h3>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Paste a YouTube video URL for tutorial or showcase. Supports youtube.com/watch?v=... or youtu.be/... links.</p>
                                                        <input
                                                            type="url"
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            value={gameForm.videoUrl}
                                                            onChange={e => setGameForm({ ...gameForm, videoUrl: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                                                        />
                                                    </div>
                                                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800 mt-6">
                                                        <button type="button" onClick={closeGameModal} className="px-6 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                                        <button type="submit" className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5">{editingGameId ? 'Update Game Node' : 'Publish Game Node'}</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="flex-1 space-y-4">
                                <input
                                    type="text" placeholder="Search wiki database..."
                                    value={gameSearch} onChange={(e) => setGameSearch(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                                />

                                {filteredAdminGames.length === 0 ? (
                                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                                        <LayoutGrid className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">Database is empty or no filters matched.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <AnimatePresence>
                                            {filteredAdminGames.map((game: any) => (
                                                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={game.id} className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all">
                                                    <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                                        <img src={game.imageUrl} alt={game.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                        <div className="absolute top-3 right-3 flex gap-2">
                                                            <button onClick={() => openGameEditor(game)} className="p-2 bg-black/40 hover:bg-indigo-500 text-white backdrop-blur-md rounded-lg shadow-md transition-colors"><Settings className="w-4 h-4" /></button>
                                                            <button onClick={() => deleteGame(game.id)} className="p-2 bg-black/40 hover:bg-red-500 text-white backdrop-blur-md rounded-lg shadow-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                        <div className="absolute bottom-3 left-3 right-3">
                                                            <h4 className="font-black text-white text-lg leading-tight line-clamp-1 truncate">{game.name[language]}</h4>
                                                            <p className="text-emerald-300 text-xs font-bold mt-0.5">{game.category?.join(', ')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{game.shortDescription[language]}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* BULK UPLOAD MODAL */}
                <AnimatePresence>
                    {isBulkUploadModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBulkUploadModalOpen(false)} />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${bulkUploadType === 'cards' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                            {bulkImportFormat === 'csv' ? <FileSpreadsheet className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                                        </div>
                                        <h3 className="font-black text-lg text-gray-900 dark:text-white capitalize">Bulk Import {bulkUploadType}</h3>
                                    </div>
                                    <button type="button" onClick={() => setIsBulkUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors shadow-sm"><X className="w-5 h-5" /></button>
                                </div>

                                {/* FORMAT TAB TOGGLE (Cards only) */}
                                {bulkUploadType === 'cards' && (
                                    <div className="flex gap-1 px-6 pt-5">
                                        <button
                                            type="button"
                                            onClick={() => setBulkImportFormat('json')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-l-xl border text-sm font-bold transition-all ${
                                                bulkImportFormat === 'json'
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <Layers className="w-4 h-4" /> JSON
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBulkImportFormat('csv')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-r-xl border text-sm font-bold transition-all ${
                                                bulkImportFormat === 'csv'
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <FileSpreadsheet className="w-4 h-4" /> CSV
                                        </button>
                                    </div>
                                )}

                                <div className="p-6">
                                    {bulkImportFormat === 'json' ? (
                                        <>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
                                                Upload a valid <strong>.json</strong> array mapped to the Card or Game interface schema.
                                            </p>
                                            <label className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                                bulkUploadType === 'cards'
                                                    ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/5 dark:hover:bg-indigo-500/10'
                                                    : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10'
                                            }`}>
                                                {isProcessingBulk ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                                                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Processing...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Layers className={`w-10 h-10 mb-3 ${bulkUploadType === 'cards' ? 'text-indigo-400' : 'text-emerald-400'}`} />
                                                        <span className="font-bold text-gray-700 dark:text-gray-300">Click or Drag JSON</span>
                                                        <span className="text-xs font-medium text-gray-400 mt-1">Accepts .json Array Payloads</span>
                                                    </>
                                                )}
                                                <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} disabled={isProcessingBulk} />
                                            </label>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                                                Upload a <strong>.csv</strong> file with the correct column headers. Download the template to get started.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={downloadCsvTemplate}
                                                className="mb-4 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Download className="w-4 h-4" /> Download Template (CSV)
                                            </button>
                                            <label className="w-full h-40 border-2 border-dashed border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/5 dark:hover:bg-indigo-500/10 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors">
                                                {isProcessingBulk ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                                                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Processing...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FileSpreadsheet className="w-10 h-10 mb-3 text-indigo-400" />
                                                        <span className="font-bold text-gray-700 dark:text-gray-300">Click or Drag CSV</span>
                                                        <span className="text-xs font-medium text-gray-400 mt-1">Accepts .csv with header row</span>
                                                    </>
                                                )}
                                                <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={isProcessingBulk} />
                                            </label>
                                            <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Required CSV Columns:</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 font-mono leading-relaxed">gameId, name_en, name_id, type_en, type_id, effect_en, effect_id</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 font-mono leading-relaxed">lore_en, lore_id, imageUrl, color</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

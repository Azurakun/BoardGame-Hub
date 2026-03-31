import { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Swords, Plus, Minus, UserPlus, Trash2 } from 'lucide-react';

interface Player {
    id: string;
    name: string;
    value: number;
}

export function GenericTracker() {
    const [players, setPlayers] = useState<Player[]>([
        { id: '1', name: 'Player 1', value: 20 },
        { id: '2', name: 'Player 2', value: 20 },
    ]);
    const [editingPlayer, setEditingPlayer] = useState<string | null>(null);

    const addPlayer = () => {
        if (players.length >= 8) return;
        const newPlayer: Player = {
            id: Date.now().toString(),
            name: `Player ${players.length + 1}`,
            value: 20,
        };
        setPlayers([...players, newPlayer]);
    };

    const removePlayer = (id: string) => {
        if (players.length <= 1) return;
        setPlayers(players.filter(p => p.id !== id));
    };

    const updatePlayerValue = (id: string, delta: number) => {
        setPlayers(players.map(p =>
            p.id === id ? { ...p, value: Math.max(0, p.value + delta) } : p
        ));
    };

    const updatePlayerName = (id: string, name: string) => {
        setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
    };

    const resetAll = () => {
        setPlayers(players.map(p => ({ ...p, value: 20 })));
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Swords className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Universal Tracker</h2>
                </div>
                <button
                    onClick={resetAll}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </div>

            {/* Players List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {players.map((player) => (
                    <motion.div
                        layout
                        key={player.id}
                        className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 relative group"
                    >
                        <div className="flex items-center justify-between mb-6">
                            {editingPlayer === player.id ? (
                                <input
                                    type="text"
                                    value={player.name}
                                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                                    onBlur={() => setEditingPlayer(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingPlayer(null)}
                                    className="text-lg font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 rounded-lg px-3 py-1 w-2/3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    autoFocus
                                />
                            ) : (
                                <h3
                                    onClick={() => setEditingPlayer(player.id)}
                                    className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {player.name}
                                </h3>
                            )}
                            {players.length > 1 && (
                                <button
                                    onClick={() => removePlayer(player.id)}
                                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => updatePlayerValue(player.id, -1)}
                                className="w-14 h-14 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                            >
                                <Minus className="w-6 h-6" />
                            </button>

                            <div className="flex-1 text-center">
                                <span className="text-5xl font-black text-gray-900 dark:text-white block">
                                    {player.value}
                                </span>
                            </div>

                            <button
                                onClick={() => updatePlayerValue(player.id, 1)}
                                className="w-14 h-14 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-500 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex gap-2 mt-6">
                            {[-5, 5, 10].map(val => (
                                <button
                                    key={val}
                                    onClick={() => updatePlayerValue(player.id, val)}
                                    className="flex-1 py-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold border border-gray-200 dark:border-slate-700 transition-colors"
                                >
                                    {val > 0 ? '+' : ''}{val}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Player Button */}
            {players.length < 8 && (
                <button
                    onClick={addPlayer}
                    className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Add Player</span>
                </button>
            )}
        </div>
    );
}

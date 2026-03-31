import { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Coins, Minus, Plus, Banknote, History } from 'lucide-react';

interface Banker {
    id: string;
    name: string;
    balance: number;
}

export function MonopolyBank() {
    const [players, setPlayers] = useState<Banker[]>([
        { id: '1', name: 'Player 1', balance: 1500 },
        { id: '2', name: 'Bank', balance: 99999 }, // Simplified infinite bank
        { id: '3', name: 'Player 2', balance: 1500 },
    ]);

    const [amount, setAmount] = useState<number>(0);
    const [senderId, setSenderId] = useState<string>('2'); // Default to Bank
    const [receiverId, setReceiverId] = useState<string>('1');

    const handleTransfer = () => {
        if (amount <= 0 || senderId === receiverId) return;

        setPlayers(current => current.map(p => {
            if (p.id === senderId && p.id !== '2') { // Bank doesn't lose balance conceptually
                return { ...p, balance: p.balance - amount };
            }
            if (p.id === receiverId) {
                return { ...p, balance: p.balance + amount };
            }
            return p;
        }));
        setAmount(0);
    };

    const addGoMoney = (id: string) => {
        setPlayers(current => current.map(p =>
            p.id === id ? { ...p, balance: p.balance + 200 } : p
        ));
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-emerald-100 dark:border-emerald-900/50 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Bank</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Balances */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Account Balances</h3>
                    {players.map(player => (
                        <motion.div
                            layout
                            key={player.id}
                            className={`flex items-center justify-between p-4 rounded-xl border ${player.id === '2' ? 'bg-slate-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700' : 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${player.id === '2' ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'}`}>
                                    {player.id === '2' ? <Banknote className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{player.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">${player.balance}</span>
                                {player.id !== '2' && (
                                    <button
                                        onClick={() => addGoMoney(player.id)}
                                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        +200 GO
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Transfer Terminal */}
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Transfer Funds</h3>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500">FROM</label>
                                <select
                                    value={senderId}
                                    onChange={(e) => setSenderId(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500">TO</label>
                                <select
                                    value={receiverId}
                                    onChange={(e) => setReceiverId(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">AMOUNT</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">$</span>
                                <input
                                    type="number"
                                    value={amount || ''}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    placeholder="0"
                                    className="w-full text-4xl font-black text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl pl-10 pr-4 py-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {[10, 50, 100, 500].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(prev => prev + val)}
                                    className="py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-400 rounded-lg font-bold border border-emerald-100 dark:border-emerald-800/50 transition-colors"
                                >
                                    +${val}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleTransfer}
                            disabled={amount <= 0 || senderId === receiverId}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-black rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            Confirm Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

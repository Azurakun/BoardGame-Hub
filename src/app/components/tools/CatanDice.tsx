import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dice5, RotateCcw, AlertTriangle } from 'lucide-react';

export function CatanDice() {
    const [history, setHistory] = useState<number[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    const [currentRoll, setCurrentRoll] = useState<{ d1: number, d2: number } | null>(null);

    const rollDice = () => {
        if (isRolling) return;
        setIsRolling(true);

        // Quick animation effect
        let rolls = 0;
        const interval = setInterval(() => {
            setCurrentRoll({
                d1: Math.floor(Math.random() * 6) + 1,
                d2: Math.floor(Math.random() * 6) + 1
            });
            rolls++;
            if (rolls > 15) {
                clearInterval(interval);

                // Final Roll
                const finalD1 = Math.floor(Math.random() * 6) + 1;
                const finalD2 = Math.floor(Math.random() * 6) + 1;
                const total = finalD1 + finalD2;

                setCurrentRoll({ d1: finalD1, d2: finalD2 });
                setHistory(prev => [total, ...prev].slice(0, 20)); // Keep last 20 rolls
                setIsRolling(false);
            }
        }, 40);
    };

    const getFrequencies = () => {
        const freqs: Record<number, number> = {};
        for (let i = 2; i <= 12; i++) freqs[i] = 0;
        history.forEach(roll => { freqs[roll]++; });
        return freqs;
    };

    const freqs = getFrequencies();
    const totalColor = currentRoll && (currentRoll.d1 + currentRoll.d2 === 7)
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-900 dark:text-white';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-amber-100 dark:border-amber-900/50 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Dice5 className="w-6 h-6 text-amber-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catan Roller</h2>
                </div>
                <button
                    onClick={() => { setHistory([]); setCurrentRoll(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset Stats</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Rolling Area */}
                <div className="flex flex-col items-center justify-center space-y-10">
                    <div className="flex gap-6">
                        <motion.div
                            animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: isRolling ? Infinity : 0, duration: 0.3 }}
                            className="w-24 h-24 bg-red-500 rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center border-4 border-white dark:border-slate-800"
                        >
                            <span className="text-5xl font-black text-white">{currentRoll?.d1 || '·'}</span>
                        </motion.div>

                        <motion.div
                            animate={isRolling ? { rotate: [360, 270, 180, 90, 0], scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: isRolling ? Infinity : 0, duration: 0.3 }}
                            className="w-24 h-24 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center border-4 border-white dark:border-slate-800"
                        >
                            <span className="text-5xl font-black text-white">{currentRoll?.d2 || '·'}</span>
                        </motion.div>
                    </div>

                    <div className="text-center h-20">
                        {currentRoll && !isRolling && (
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                                <span className={`text-6xl font-black ${totalColor}`}>
                                    {currentRoll.d1 + currentRoll.d2}
                                </span>
                                {currentRoll.d1 + currentRoll.d2 === 7 && (
                                    <span className="text-sm font-bold text-red-500 mt-2 uppercase flex items-center gap-1">
                                        <AlertTriangle className="w-4 h-4" /> Move the Robber!
                                    </span>
                                )}
                            </motion.div>
                        )}
                    </div>

                    <button
                        onClick={rollDice}
                        disabled={isRolling}
                        className="w-full py-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-2xl font-black rounded-2xl transition-all shadow-xl shadow-amber-500/30 hover:-translate-y-1 active:translate-y-0"
                    >
                        {isRolling ? 'Rolling...' : 'ROLL DICE'}
                    </button>
                </div>

                {/* Statistics Area */}
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Distribution Probability</h3>

                    <div className="space-y-3">
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                            const count = freqs[num] || 0;
                            const maxCount = Math.max(...Object.values(freqs)) || 1;
                            const percentage = (count / maxCount) * 100;

                            return (
                                <div key={num} className="flex items-center gap-4">
                                    <div className={`w-8 text-right font-bold ${num === 7 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {num}
                                    </div>
                                    <div className="flex-1 h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className={`h-full rounded-full ${num === 7 ? 'bg-red-500' : 'bg-amber-500'}`}
                                        />
                                    </div>
                                    <div className="w-8 text-sm font-medium text-gray-500">
                                        {count}x
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

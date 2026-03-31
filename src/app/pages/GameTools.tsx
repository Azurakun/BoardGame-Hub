import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Calculator, Coins, Dice5, Swords, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Import our individual tools
import { GenericTracker } from '../components/tools/GenericTracker';
import { MonopolyBank } from '../components/tools/MonopolyBank';
import { CatanDice } from '../components/tools/CatanDice';

type ToolCategory = 'hub' | 'generic' | 'monopoly' | 'catan';

export function GameTools() {
  const { t } = useLanguage();
  const [activeTool, setActiveTool] = useState<ToolCategory>('hub');

  const toolsList = [
    {
      id: 'generic',
      title: t('tools.generic.title' as any),
      desc: t('tools.generic.desc' as any),
      icon: <Swords className="w-8 h-8 text-indigo-500" />,
      color: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'monopoly',
      title: t('tools.monopoly.title' as any),
      desc: t('tools.monopoly.desc' as any),
      icon: <Coins className="w-8 h-8 text-emerald-500" />,
      color: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'catan',
      title: t('tools.catan.title' as any),
      desc: t('tools.catan.desc' as any),
      icon: <Dice5 className="w-8 h-8 text-amber-500" />,
      color: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 min-h-[calc(100vh-8rem)]">
      {/* Header Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{t('tools.title')}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('tools.subtitle')}</p>
          </div>
        </div>

        {activeTool !== 'hub' && (
          <button
            onClick={() => setActiveTool('hub')}
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-bold shadow-sm border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Hub
          </button>
        )}
      </motion.div>

      {/* Mobile Back Button */}
      {activeTool !== 'hub' && (
        <button
          onClick={() => setActiveTool('hub')}
          className="sm:hidden mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Hub
        </button>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">

        {/* HUB VIEW */}
        {activeTool === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {toolsList.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setActiveTool(tool.id as ToolCategory)}
                className={`rounded-3xl p-8 cursor-pointer border hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl ${tool.color} group relative overflow-hidden`}
              >
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-150 transition-transform duration-500">
                  {tool.icon}
                </div>
                <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-slate-700 relative z-10">
                  {tool.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">{tool.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 relative z-10 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* SPECIFIC TOOLS */}
        {activeTool === 'generic' && (
          <motion.div key="generic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <GenericTracker />
          </motion.div>
        )}

        {activeTool === 'monopoly' && (
          <motion.div key="monopoly" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <MonopolyBank />
          </motion.div>
        )}

        {activeTool === 'catan' && (
          <motion.div key="catan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <CatanDice />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

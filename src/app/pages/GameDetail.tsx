import { useParams, Navigate, useNavigate } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, Brain, Info, BookOpen, Scroll, ChevronRight, ChevronLeft, Tags, Calendar, User, HelpCircle, Play, Maximize2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
  return match ? match[1] : null;
}
import { useGames } from '../contexts/GamesContext';

type Tab = 'overview' | 'how-to-play' | 'rules' | 'faq';

export function GameDetail() {
  const { gameId } = useParams();
  const { language, t } = useLanguage();
  const { games } = useGames();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const game = games.find(g => g.id === gameId);

  if (!game) {
    return <Navigate to="/wiki" replace />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('game.tab_overview'), icon: <Info className="w-5 h-5" /> },
    { id: 'how-to-play', label: t('game.tab_how_to_play'), icon: <BookOpen className="w-5 h-5" /> },
    { id: 'rules', label: t('game.tab_rules'), icon: <Scroll className="w-5 h-5" /> },
  ];

  if (game.faq && game.faq.length > 0) {
    tabs.push({ id: 'faq', label: language === 'en' ? 'FAQ' : 'Tanya Jawab', icon: <HelpCircle className="w-5 h-5" /> });
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 space-y-8">
      {/* Back to Wiki */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/wiki')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        {language === 'en' ? 'Back to Wiki' : 'Kembali ke Wiki'}
      </motion.button>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-gray-900 border border-slate-800">
          <img
            src={game.imageUrl}
            alt={game.name[language]}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 w-full p-6 sm:p-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {game.category.map((cat, i) => (
              <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 tracking-tight">
            {game.name[language]}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 max-w-2xl">
            {game.shortDescription[language]}
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Content Area (Tabs & Data) */}
        <div className="flex-1 space-y-8">
          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-2 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose dark:prose-invert max-w-none"
                >
                  <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                    {game.description[language]}
                  </p>
                </motion.div>
              )}

              {activeTab === 'how-to-play' && (
                <motion.div
                  key="how-to-play"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {game.howToPlay[language].map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {index + 1}
                      </div>
                      <p className="text-lg text-gray-700 dark:text-gray-300 pt-1 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'rules' && (
                <motion.div
                  key="rules"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {game.rules.map((rule, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {rule.title[language]}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {rule.content[language]}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'faq' && game.faq && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {game.faq.map((item, index) => (
                    <div key={index} className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/30">
                      <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-start gap-3">
                        <HelpCircle className="w-6 h-6 shrink-0 mt-0.5" />
                        {item.q[language]}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-9 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                        {item.a[language]}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar (Metadata Specs) */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6">Game Spec</h3>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('wiki.players')}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{game.minPlayers} - {game.maxPlayers}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('wiki.time')}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{game.playTime} {t('wiki.mins')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('wiki.complexity')}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${level <= game.complexity
                          ? 'bg-purple-600 dark:bg-purple-400'
                          : 'bg-gray-200 dark:bg-slate-700'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-100 dark:border-slate-700" />

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1"><User className="w-3.5 h-3.5" /> Designer</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{game.designer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5" /> Released</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{game.yearPublished}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-2"><Tags className="w-3.5 h-3.5" /> Mechanics</p>
                <div className="flex flex-wrap gap-2">
                  {game.mechanics.map((mech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium">
                      {mech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* YouTube Video Section */}
      {game.videoUrl && getYouTubeId(game.videoUrl) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-8 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {language === 'en' ? 'Video Tutorial' : 'Video Tutorial'}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {language === 'en' ? 'Watch how to play this game' : 'Tonton cara bermain game ini'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              {language === 'en' ? 'Click fullscreen in player' : 'Klik layar penuh di pemutar'}
            </span>
          </div>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(game.videoUrl)}`}
              title={`${game.name[language]} - Video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

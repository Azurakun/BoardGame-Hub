import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { LibrarySquare, BookOpen, ChevronRight, Zap, Target, Smartphone, Search, Users, Shield, Star, Crown, Database, ArrowRight } from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { useGames } from '../contexts/GamesContext';

export function Home() {
  const { t } = useLanguage();
  const { games } = useGames();
  const navigate = useNavigate();

  // Grab a slice of the top games for the featured section
  const featuredGames = games.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 overflow-hidden font-sans">

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 flex flex-col justify-center items-center overflow-visible">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 dark:from-indigo-500/10 dark:to-purple-500/5 rounded-full blur-[120px] -top-20 -right-20"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 rounded-full blur-[100px] bottom-0 -left-20"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-5xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold text-sm mb-8 border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
          >
            <Crown className="w-4 h-4" /> The Ultimate Tabletop Companion
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 sm:mb-8 leading-[1.1]">
            {t('hero.title') || "Elevate Your"} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              {t('nav.app_name')} Experience
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12"
          >
            {t('hero.subtitle') || "Ditch the paper and messy tokens. Our suite of digital trackers, rulebooks, and card databases brings your favorite board games into the modern era."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <button
              onClick={() => navigate('/wiki')}
              className="w-full sm:w-auto px-10 py-4.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-lg hover:scale-105 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-gray-900/20 dark:shadow-white/10"
            >
              <LibrarySquare className="w-6 h-6 text-indigo-400 dark:text-indigo-600" />
              {t('promo.cta_wiki') || "Explore Game Wiki"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform opacity-70" />
            </button>
            <button
              onClick={() => navigate('/tools')}
              className="w-full sm:w-auto px-10 py-4.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl font-bold text-lg hover:scale-105 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-slate-700 shadow-xl shadow-gray-200/50 dark:shadow-none"
            >
              <Target className="w-6 h-6 text-pink-500" />
              Use Game Tools
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Application Mockup / Promo Image Placeholder */}
      <section className="px-4 sm:px-6 lg:px-8 pb-32">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border-[8px] border-gray-100 dark:border-slate-800 ring-1 ring-gray-900/5"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm">
              <BookOpen className="w-16 h-16 text-white/50 mb-6" />
              <h3 className="text-3xl font-bold text-white mb-2">Platform Preview</h3>
              <p className="text-indigo-200 max-w-md">
                Provide an image showcasing the application UI (e.g. a stylized mockup of the dashboard or tools). Replace the src of this div with the uploaded image.
              </p>
            </div>
            {/* Example Implementation: <img src="/mockup.png" alt="App Preview" className="absolute inset-0 w-full h-full object-cover opacity-90" /> */}
          </motion.div>
        </div>
      </section>

      {/* How it Works / Core Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-32 bg-gray-50/50 dark:bg-slate-900/30 border-y border-gray-100 dark:border-slate-800/50">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Everything You Need to Play
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A fully integrated ecosystem designed to solve the most annoying parts of tabletop gaming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {[
              {
                icon: <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
                title: t('promo.step1') || "Instant Rule Lookup",
                desc: t('promo.step1_desc') || "Never argue over the rules again. Searchable wikis, FAQs, and step-by-step guides for top games.",
                bg: 'bg-indigo-100 dark:bg-indigo-500/20',
                border: 'border-indigo-100 dark:border-indigo-500/10'
              },
              {
                icon: <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
                title: t('promo.step2') || "Dynamic Trackers",
                desc: t('promo.step2_desc') || "Calculate scores, bank money, roll dice, and track player stats with our interactive toolsets.",
                bg: 'bg-amber-100 dark:bg-amber-500/20',
                border: 'border-amber-100 dark:border-amber-500/10'
              },
              {
                icon: <Database className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
                title: t('promo.step3') || "Card Databases",
                desc: t('promo.step3_desc') || "View expansions, check card effects, and strategize before the game even begins with the Card Viewer.",
                bg: 'bg-emerald-100 dark:bg-emerald-500/20',
                border: 'border-emerald-100 dark:border-emerald-500/10'
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-xl shadow-gray-200/30 dark:shadow-none border ${step.border} relative z-10 hover:-translate-y-2 transition-transform duration-300`}
              >
                <div className={`w-20 h-20 ${step.bg} rounded-2xl flex items-center justify-center mb-8 transform -rotate-3`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      {featuredGames.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-32 bg-white dark:bg-slate-950">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Featured Support
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Custom tools and wikis for the world's best games.
                </p>
              </div>
              <button onClick={() => navigate('/wiki')} className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                View Full Directory <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredGames.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Testimonials */}
      <section className="px-4 sm:px-6 lg:px-8 py-32 bg-gray-900 dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Loved by Players
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of playgroups using our companion to streamline game night.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Alex Harrison", group: "Weekly Catan League", quote: "The Monopoly bank tracker has saved us from so many arguments. It's incredibly fast to use and the UI is gorgeous." },
              { name: "Sarah Jenkins", group: "Family Game Night", quote: "Having the FAQs and translated wikis on hand is a blessing for teaching new games to the kids. Huge time saver." },
              { name: "David Kim", group: "Hardcore Strategists", quote: "The Here to Slay database is phenomenal. Being able to lookup card effects instantly keeps the game flowing." }
            ].map((test, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10"
              >
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-8 italic">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {test.name[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{test.name}</h4>
                    <p className="text-gray-400 text-sm">{test.group}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-32 text-center bg-white dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-20 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -m-20 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10 leading-tight">
            Ready to upgrade your game night?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button onClick={() => navigate('/tools')} className="px-10 py-5 bg-white text-indigo-900 rounded-2xl font-black text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-black/20">
              Open Tools Panel <Target className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

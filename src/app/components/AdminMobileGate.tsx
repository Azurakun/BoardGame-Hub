import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Monitor, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function AdminMobileGate() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm w-full text-center"
      >
        {/* Icon */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Monitor className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          {t('admin.mobile_gate_title' as any)}
        </h1>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 text-base">
          {t('admin.mobile_gate_desc' as any)}
        </p>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/15 dark:shadow-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('admin.mobile_gate_back' as any)}
        </button>

        {/* Decorative dots */}
        <div className="flex justify-center gap-1.5 mt-10">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

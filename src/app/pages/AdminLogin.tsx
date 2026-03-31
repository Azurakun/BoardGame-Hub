import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useIsMobile } from '../components/ui/use-mobile';
import { AdminMobileGate } from '../components/AdminMobileGate';

export function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    // Block admin login on mobile
    if (isMobile) {
        return <AdminMobileGate />;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/admin/dashboard');
        } else {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-24">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-center"
            >
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('admin.login_title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {t('admin.login_desc')}
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder={t('admin.password_placeholder')}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none transition-all ${error
                                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                                }`}
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 text-left">{t('admin.login_error')}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
                    >
                        {t('admin.login_button')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, Brain, CheckCircle2, FileText, Shield, Sparkles, TrendingUp, Upload,
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PRODUCT_STEPS } from '../constants/productSteps';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Upload,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'Extracție automată cu AI',
    desc: 'Încarcă PDF-ul de la laborator și AI-ul extrage valorile numerice fără introducere manuală.',
  },
  {
    icon: FileText,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    title: 'Istoric complet',
    desc: 'Toate analizele tale salvate într-un singur loc, accesibile oricând, cu status și intervale de referință.',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    title: 'Evoluție în timp',
    desc: 'Vizualizează cum se schimbă valorile tale de la o analiză la alta și identifică tendințele.',
  },
  {
    icon: Brain,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Raport AI personalizat',
    desc: 'Primești un rezumat inteligent al stării tale de sănătate, cu interpretări și recomandări.',
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold mb-6">
              <Sparkles size={14} />
              Inteligență artificială pentru sănătatea ta
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Înțelege-ți analizele medicale cu AI
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed mb-10 max-w-xl">
              MedScan transformă PDF-urile de la laborator în date structurate, le urmărește în timp și îți oferă un raport personalizat — simplu, clar, inteligent.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue-700 rounded-xl font-semibold text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Începe gratuit
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-sm transition-all"
              >
                Autentificare
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
              Cum funcționează MedScan
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm sm:text-base">
              Trei pași simpli pentru a-ți înțelege analizele medicale cu ajutorul inteligenței artificiale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {PRODUCT_STEPS.map(({ step, icon: Icon, iconBg, iconColor, numColor, borderColor, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.1 }}
                className={`relative bg-white dark:bg-zinc-900 border ${borderColor} rounded-2xl p-6`}
              >
                <span className={`absolute top-5 right-5 text-3xl font-black ${numColor} select-none leading-none`}>{step}</span>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg} ${iconColor}`}>
                  <Icon size={22} />
                </div>
                <p className="font-semibold text-zinc-900 dark:text-white mb-2">{title}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
              Tot ce ai nevoie într-un singur loc
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm sm:text-base">
              De la importul PDF-ului până la raportul AI — MedScan îți simplifică gestionarea analizelor medicale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURES.map(({ icon: Icon, iconBg, iconColor, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white mb-1.5">{title}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-10 sm:p-14 text-center">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                <Activity size={28} className="text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Gata să-ți înțelegi analizele?
              </h2>
              <p className="text-blue-100 mb-8 max-w-md mx-auto">
                Creează un cont gratuit și încarcă primul PDF în câteva minute.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 rounded-xl font-semibold text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Creează cont gratuit
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Activity size={14} className="text-white" />
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">MedScan</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 max-w-md">
              <Shield size={14} className="shrink-0 mt-0.5" />
              <p>
                Informațiile oferite de MedScan sunt orientative și generate automat de inteligență artificială.
                Nu înlocuiesc consultul medical profesionist.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-zinc-400">
            {PRODUCT_STEPS.map(s => (
              <span key={s.step} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

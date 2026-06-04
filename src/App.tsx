import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Activity, FileText, Home, Upload, User, AlertCircle, CheckCircle2, LogOut, ArrowRight, Lock, Mail, Download, ChevronRight, Calendar, BarChart2, Sparkles, Trash2, TrendingUp, TrendingDown, Minus, Search, Shield, RefreshCw, ChevronDown, Loader2, Brain, FlaskConical, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService, userService, medicalRecordsService, healthReportService } from './api';
import { AnalysisUploader } from './components/AnalysisUploader';
import { EvolutionChart } from './components/EvolutionChart';
import type { EvolutionDataPoint } from './components/EvolutionChart';
import type { MedicalAnalysis, MedicalRecordDto, MedicalRecordSummaryDto, AiHealthReportDto, StareGenerala } from './types/medical';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: string;
}

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    userService.getProfile().then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Upload, label: 'Upload PDF', path: '/upload' },
    { icon: FileText, label: 'Analizele mele', path: '/records' },
    { icon: TrendingUp, label: 'Evoluție', path: '/evolution' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800/60 flex flex-col sticky top-0 shrink-0">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
          <Activity size={17} className="text-white" />
        </div>
        <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">MedScan</span>
        <span className="ml-auto text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">Beta</span>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">{profile?.name || '—'}</p>
            <p className="text-xs text-zinc-400 leading-tight">Delogare</p>
          </div>
          <LogOut size={15} className="text-zinc-400 group-hover:text-red-500 transition-colors shrink-0" />
        </button>
      </div>
    </aside>
  );
}

// ── Dashboard helper utilities ────────────────────────────────────────────────

const STARE_CONFIG: Record<StareGenerala, { gradient: string; badge: string; label: string }> = {
  normal:       { gradient: 'from-emerald-600 to-green-500',  badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30', label: 'Stare Normală' },
  atentie:      { gradient: 'from-amber-600 to-yellow-500',   badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30',     label: 'Atenție' },
  monitorizare: { gradient: 'from-orange-600 to-amber-500',   badge: 'bg-orange-500/20 text-orange-200 border-orange-400/30',  label: 'Necesită Monitorizare' },
  critica:      { gradient: 'from-red-600 to-rose-500',       badge: 'bg-red-500/20 text-red-200 border-red-400/30',           label: 'Stare Critică' },
};

function getAnalysisStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case 'crescut':  return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    case 'scazut':   return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    case 'anormal':  return 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
    default:         return 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
  }
}

function getUrgencyClass(urgenta: string) {
  switch (urgenta.toLowerCase()) {
    case 'urgent':    return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    case 'recomandat': return 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    default:          return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800';
  }
}

function TrendIndicator({ trend }: { trend: string | null }) {
  if (trend === 'crescator')    return <TrendingUp size={12} className="text-red-400 inline" />;
  if (trend === 'descrescator') return <TrendingDown size={12} className="text-blue-400 inline" />;
  if (trend === 'stabil')       return <Minus size={12} className="text-zinc-400 inline" />;
  return null;
}

// ── Dashboard component ───────────────────────────────────────────────────────

function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecordSummaryDto[]>([]);
  const [aiReport, setAiReport] = useState<AiHealthReportDto | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bună dimineața' : hour < 18 ? 'Bună ziua' : 'Bună seara';
  const firstName = profile?.name ? profile.name.split(' ')[0] : '';
  const today = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
  const totalAnalyses = records.reduce((acc, r) => acc + r.resultCount, 0);
  const lastRecord = records.find(r => r.collectionDate);
  const lastScanDate = lastRecord?.collectionDate
    ? new Date(lastRecord.collectionDate).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  useEffect(() => {
    Promise.all([
      userService.getProfile().then(res => setProfile(res.data)).catch(console.error),
      medicalRecordsService.getAll().then(res => setRecords(res.data)).catch(console.error),
      healthReportService.getLatest().then(res => setAiReport(res.data)).catch(() => {}),
    ]).finally(() => setLoadingInitial(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await healthReportService.generate();
      setAiReport(res.data);
    } catch {
      setGenError('Eroare la generarea raportului. Încearcă din nou.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 size={28} className="animate-spin" />
          <span className="text-sm">Se încarcă datele...</span>
        </div>
      </div>
    );
  }

  // ── No records ─────────────────────────────────────────────────────────────
  if (records.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-1.5 capitalize">{today}</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-10">
          {greeting}{firstName ? `, ${firstName}` : ''}!
        </h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/10 flex items-center justify-center mb-6">
            <FileText size={32} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-white mb-2">Nicio analiză încărcată</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
            Încarcă primul tău raport medical pentru a accesa interpretarea AI și urmărirea tendințelor.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20"
          >
            <Upload size={18} />
            Încarcă un PDF
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Stats cards (reused in "no report" and "has report" states) ────────────
  const statsCards = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { icon: FileText,  label: 'Rapoarte',      value: String(records.length), color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { icon: BarChart2, label: 'Total analize', value: String(totalAnalyses),  color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
        { icon: Calendar,  label: 'Ultima scanare',value: lastScanDate || '—',    color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
      ].map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${bg} ${color}`}>
            <Icon size={16} />
          </div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
        </div>
      ))}
    </div>
  );

  // ── Has records but no report (or currently generating) ───────────────────
  if (!aiReport) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-1.5 capitalize">{today}</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          {greeting}{firstName ? `, ${firstName}` : ''}!
        </h1>
        {statsCards}

        {generating ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <Heart size={30} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 animate-ping" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">MedScan analizează valorile tale...</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
              AI-ul procesează {records.length} rapoarte cu {totalAnalyses} analize. Poate dura 20–40 de secunde.
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-zinc-900 dark:to-indigo-950/80 border border-indigo-800/30 rounded-2xl p-8">
            <div className="absolute -right-12 -top-12 w-56 h-56 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-indigo-300 shrink-0">
                <Brain size={26} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-white">Raport AI de Sănătate</h3>
                  <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/20">Nou</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed max-w-xl">
                  Generează un raport complet bazat pe toate cele {records.length} rapoarte salvate ({totalAnalyses} analize).
                  MedScan identifică tendințe, oferă interpretări personalizate și sugerează analize complementare.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Interpretare analize', 'Cauze și riscuri', 'Recomandări', 'Tendințe'].map(f => (
                    <span key={f} className="text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">{f}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleGenerate}
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={17} />
                Generează Raport AI
              </button>
            </div>
            {genError && <p className="mt-4 text-sm text-red-400 relative">{genError}</p>}
          </div>
        )}
      </div>
    );
  }

  // ── Full report view ───────────────────────────────────────────────────────
  const stareKey = (aiReport.stareGenerala as StareGenerala) in STARE_CONFIG
    ? aiReport.stareGenerala as StareGenerala
    : 'normal';
  const colors = STARE_CONFIG[stareKey];
  const totalInterpreted = aiReport.interpretareAnalize.reduce((a, g) => a + g.analize.length, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-1.5 capitalize">{today}</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {greeting}{firstName ? `, ${firstName}` : ''}!
          </h1>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Se generează...' : 'Regenerează'}
        </button>
      </div>

      {/* Hero status card */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 shadow-xl`}>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Shield size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors.badge}`}>
                {colors.label.toUpperCase()}
              </span>
              <span className="text-xs text-white/60">
                Generat {new Date(aiReport.generatedAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed max-w-2xl">{aiReport.rezumat}</p>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-white/70">{aiReport.recordCount} rapoarte analizate</span>
              <span className="text-xs text-white/70">{totalAnalyses} valori totale</span>
              <span className="text-xs text-white/70">{totalInterpreted} analize interpretate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {statsCards}

      {/* Analysis interpretation accordion */}
      {aiReport.interpretareAnalize.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Interpretare Analize</h2>
          <div className="space-y-2">
            {aiReport.interpretareAnalize.map((group) => {
              const isOpen = openCategories.has(group.categorie);
              const abnormalCount = group.analize.filter(a => a.status !== 'normal').length;
              return (
                <div key={group.categorie} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(group.categorie)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">{group.categorie}</span>
                      {abnormalCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          {abnormalCount} deviat{abnormalCount !== 1 ? 'e' : 'ă'}
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">{group.analize.length} analize</span>
                    </div>
                    <ChevronDown size={16} className={`text-zinc-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                      {group.analize.map((analiza) => (
                        <div key={analiza.denumire} className="px-5 py-4">
                          <div className="flex items-start gap-3 flex-wrap mb-1.5">
                            <span className="font-medium text-zinc-800 dark:text-zinc-100 text-sm">{analiza.denumire}</span>
                            {analiza.valoareCurenta != null && (
                              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                {analiza.valoareCurenta} {analiza.unitate}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getAnalysisStatusClass(analiza.status)}`}>
                              {analiza.status.toUpperCase()}
                            </span>
                            {analiza.trend && analiza.trend !== 'insuficient_date' && (
                              <span className="flex items-center gap-1 text-xs text-zinc-500">
                                <TrendIndicator trend={analiza.trend} />
                                <span className="ml-0.5">{analiza.trend}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{analiza.interpretareText}</p>

                          {(analiza.cauzePosibile.length > 0 || analiza.riscuri.length > 0 || analiza.recomandariSpecifice.length > 0) && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {analiza.cauzePosibile.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cauze posibile</p>
                                  <ul className="space-y-1">
                                    {analiza.cauzePosibile.map((c, i) => (
                                      <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400 flex gap-1.5 items-start">
                                        <span className="text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5">•</span>{c}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analiza.riscuri.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Riscuri</p>
                                  <ul className="space-y-1">
                                    {analiza.riscuri.map((r, i) => (
                                      <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400 flex gap-1.5 items-start">
                                        <span className="text-amber-400 shrink-0 mt-0.5">!</span>{r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analiza.recomandariSpecifice.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Recomandări</p>
                                  <ul className="space-y-1">
                                    {analiza.recomandariSpecifice.map((r, i) => (
                                      <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400 flex gap-1.5 items-start">
                                        <span className="text-emerald-400 shrink-0 mt-0.5">→</span>{r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommended tests */}
      {aiReport.analizeRecomandate.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Analize Recomandate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiReport.analizeRecomandate.map((test) => (
              <div key={test.denumire} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5">
                  <FlaskConical size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">{test.denumire}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getUrgencyClass(test.urgenta)}`}>
                      {test.urgenta.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{test.motiv}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Best practices */}
      {aiReport.bunePractici.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Bune Practici</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiReport.bunePractici.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{tip}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Medical disclaimer */}
      {aiReport.notaMedicala && (
        <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <AlertCircle size={15} className="text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{aiReport.notaMedicala}</p>
        </div>
      )}

      {genError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{genError}</p>
        </div>
      )}
    </div>
  );
}

function UploadPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Încarcă rezultate medicale</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1.5">Importă un document PDF și AI-ul MedScan va extrage automat valorile.</p>
      </div>
      <AnalysisUploader onSave={async (analyses: MedicalAnalysis[], file: File | null) => {
        const collectionDate = analyses[0]?.collectionDate ?? '';
        const laboratory = analyses[0]?.laboratory ?? '';
        await medicalRecordsService.save(file, collectionDate, laboratory, analyses);
      }} />
    </div>
  );
}

function AuthBrand({ mode }: { mode: 'login' | 'register' }) {
  const features = [
    'Extracție automată a valorilor cu AI',
    'Istoricul complet al analizelor tale',
    'Status și intervale de referință pentru fiecare analiză',
  ];
  return (
    <div className="hidden lg:flex flex-1 flex-col justify-between p-14 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Activity size={22} className="text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">MedScan</span>
      </div>
      <div className="relative">
        <h2 className="text-4xl font-bold text-white leading-tight mb-5 whitespace-pre-line">
          {mode === 'login' ? 'Bine ai revenit.' : 'Analizele tale,\nexplicate inteligent.'}
        </h2>
        <p className="text-lg text-blue-100 leading-relaxed">
          {mode === 'login'
            ? 'Continuă să-ți monitorizezi sănătatea cu ajutorul AI-ului medical MedScan.'
            : 'Creează-ți contul și începe să înțelegi ce îți spun analizele medicale.'}
        </p>
      </div>
      <div className="relative space-y-4">
        {features.map(f => (
          <div key={f} className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-blue-200 shrink-0" />
            <span className="text-sm text-blue-100">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.data.accessToken) localStorage.setItem('token', res.data.accessToken);
      onLogin();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Email sau parolă incorectă.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950">
      <AuthBrand mode="login" />
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-white">MedScan</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1.5">Autentificare</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Introdu credențialele pentru a accesa contul tău.</p>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm dark:text-white"
                  placeholder="ion@example.com" required />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Parolă</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Ai uitat parola?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm dark:text-white"
                  placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Se autentifică...</>
              ) : (
                <>Intră în cont <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Nu ai cont?{' '}<Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">Înregistrează-te</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function RegisterPage({ onLogin }: { onLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.register({ name, email, password, age: parseInt(age), gender });
      if (res.data.accessToken) localStorage.setItem('token', res.data.accessToken);
      onLogin();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Înregistrare eșuată. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm dark:text-white";

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950">
      <AuthBrand mode="register" />
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm py-8"
        >
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-white">MedScan</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1.5">Creează cont</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Alătură-te MedScan și începe să-ți analizezi sănătatea.</p>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nume complet</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Ion Popescu" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="ion@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Parolă</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Vârstă</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  className="w-full px-3.5 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm dark:text-white"
                  placeholder="25" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Gen</label>
                <select value={gender} onChange={e => setGender(e.target.value)}
                  className="w-full px-3.5 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm dark:text-white">
                  <option value="Male">Masculin</option>
                  <option value="Female">Feminin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Se creează contul...</>
              ) : (
                <>Creează cont <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Ai deja cont?{' '}<Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Autentifică-te</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function RecordsPage() {
  const [records, setRecords] = useState<MedicalRecordSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    medicalRecordsService.getAll()
      .then(res => setRecords(res.data))
      .catch(() => setFetchError('Nu am putut încărca înregistrările.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = async (id: number, fileName: string) => {
    try {
      const res = await medicalRecordsService.downloadPdf(id);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { /* silently ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); setDeleteError(''); return; }
    setDeletingId(id);
    setDeleteError('');
    try {
      await medicalRecordsService.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setDeleteError('Eroare la ștergere. Încearcă din nou.');
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Istoricul analizelor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1.5">Toate rapoartele tale medicale salvate în MedScan.</p>
      </div>

      {fetchError && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {fetchError}
        </div>
      )}

      {deleteError && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {deleteError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-5">
            <FileText size={26} />
          </div>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Nicio analiză salvată</p>
          <p className="text-sm text-zinc-400 mb-6 max-w-xs">Încarcă primul tău PDF și AI-ul va extrage automat valorile.</p>
          <Link to="/upload" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20">
            Încarcă PDF →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <div key={record.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <FileText size={19} />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{record.laboratory || 'Laborator necunoscut'}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {record.collectionDate
                      ? new Date(record.collectionDate).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Dată necunoscută'}
                    {' · '}{record.resultCount} {record.resultCount === 1 ? 'analiză' : 'analize'}
                  </p>
                  {record.pdfFileName && <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{record.pdfFileName}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {record.pdfFileName && (
                  <button onClick={() => handleDownloadPdf(record.id, record.pdfFileName!)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                    <Download size={14} /> PDF
                  </button>
                )}
                <button
                  onClick={() => handleDelete(record.id)}
                  disabled={deletingId === record.id}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition font-medium ${
                    confirmDeleteId === record.id
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                      : 'text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800'
                  }`}
                >
                  {deletingId === record.id
                    ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Trash2 size={14} />}
                  {confirmDeleteId === record.id ? 'Confirmi?' : ''}
                </button>
                <Link to={`/records/${record.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-sm shadow-blue-500/20">
                  Detalii <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MedicalRecordDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    medicalRecordsService.getById(Number(id))
      .then(res => setRecord(res.data))
      .catch(() => setError('Nu am putut încărca detaliile înregistrării.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!record?.pdfFileName) return;
    try {
      const res = await medicalRecordsService.downloadPdf(Number(id));
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url; a.download = record.pdfFileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { /* silently ignore */ }
  };

  const STATUS_LABEL: Record<string, string> = { High: 'Ridicat', Low: 'Scăzut', Abnormal: 'Anormal', Normal: 'Normal' };
  const statusCls = (s: string) =>
    s === 'High' || s === 'Abnormal'
      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'
      : s === 'Low'
      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20'
      : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20';

  const abnormalCount = record ? record.results.filter(r => r.status !== 'Normal').length : 0;
  const normalCount = record ? record.results.filter(r => r.status === 'Normal').length : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back + header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/records')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors group"
        >
          <ChevronRight size={15} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          Înapoi la istoricul analizelor
        </button>

        {loading ? (
          <div className="h-8 w-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
        ) : record ? (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {record.laboratory || 'Laborator necunoscut'}
              </h1>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {record.collectionDate && (
                  <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                    {new Date(record.collectionDate).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                )}
                {normalCount > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    {normalCount} normale
                  </span>
                )}
                {abnormalCount > 0 && (
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1 rounded-lg">
                    {abnormalCount} în afara limitelor
                  </span>
                )}
              </div>
            </div>
            {record.pdfFileName && (
              <button onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shrink-0 font-medium">
                <Download size={15} /> Descarcă PDF
              </button>
            )}
          </div>
        ) : null}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : record && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">#</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Analiză</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Valoare</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Unitate</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Referință</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {record.results.map((r, i) => {
                const isAbnormal = r.status !== 'Normal';
                return (
                  <tr key={r.id} className={`transition-colors ${isAbnormal ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'}`}>
                    <td className="px-5 py-4 text-zinc-400 text-xs tabular-nums">{i + 1}</td>
                    <td className="px-5 py-4 font-medium text-zinc-900 dark:text-white">{r.name}</td>
                    <td className={`px-5 py-4 text-right font-semibold font-mono ${isAbnormal ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {r.textValue ?? r.value ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-500 text-xs">{r.unit || '—'}</td>
                    <td className="px-5 py-4 text-right text-zinc-400 font-mono text-xs">
                      {r.minRef != null && r.maxRef != null
                        ? `${r.minRef} – ${r.maxRef}`
                        : r.minRef != null ? `≥ ${r.minRef}`
                        : r.maxRef != null ? `≤ ${r.maxRef}`
                        : '—'}
                      {r.referenceNote && <div className="text-blue-400 text-[10px] mt-0.5">{r.referenceNote}</div>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCls(r.status)}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    userService.getProfile().then(res => setProfile(res.data)).catch(console.error);
  }, []);

  if (!profile) return (
    <div className="p-8 flex justify-center">
      <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const fields = [
    { label: 'Nume complet', value: profile.name },
    { label: 'Email', value: profile.email },
    { label: 'Vârstă', value: `${profile.age} ani` },
    { label: 'Gen', value: profile.gender === 'Male' ? 'Masculin' : profile.gender === 'Female' ? 'Feminin' : profile.gender },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Profilul meu</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1.5">Informațiile contului tău MedScan.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-5 p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.name}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{profile.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0 divide-x-0">
          {fields.map(({ label, value }) => (
            <div key={label} className="p-5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-zinc-900 dark:text-white font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvolutionPage() {
  const [allRecords, setAllRecords] = useState<MedicalRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'alpha' | 'status'>('alpha');

  useEffect(() => {
    async function fetchAll() {
      try {
        const summaries = await medicalRecordsService.getAll();
        const ids = summaries.data.map((r: MedicalRecordSummaryDto) => r.id);
        setTotalCount(ids.length);
        if (ids.length === 0) { setLoading(false); return; }
        let done = 0;
        const results = await Promise.all(
          ids.map((id: number) =>
            medicalRecordsService.getById(id).then(res => {
              done++;
              setLoadedCount(done);
              return res.data as MedicalRecordDto;
            })
          )
        );
        setAllRecords(results);
      } catch {
        setFetchError('Nu am putut încărca datele pentru evoluție.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const analysisIndex = useMemo(() => {
    const map = new Map<string, EvolutionDataPoint[]>();
    for (const record of allRecords) {
      const date = record.collectionDate;
      if (!date) continue;
      for (const result of record.results) {
        if (result.value === null) continue;
        const key = result.name.trim();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({
          date,
          value: result.value,
          unit: result.unit ?? '',
          minRef: result.minRef,
          maxRef: result.maxRef,
          referenceNote: result.referenceNote ?? null,
          status: result.status ?? 'Normal',
          laboratory: record.laboratory,
          recordId: record.id,
        });
      }
    }
    map.forEach(pts => pts.sort((a, b) => a.date.localeCompare(b.date)));
    return map;
  }, [allRecords]);

  const analysisList = useMemo(() => {
    const statusPriorityOf = (s: string) =>
      s === 'High' || s === 'Abnormal' ? 0 : s === 'Low' ? 1 : 2;
    return Array.from(analysisIndex.entries())
      .map(([name, pts]) => {
        const last = pts[pts.length - 1];
        const prev = pts.length >= 2 ? pts[pts.length - 2] : null;
        const trend: 'up' | 'down' | 'stable' =
          prev === null ? 'stable'
          : last.value > prev.value ? 'up'
          : last.value < prev.value ? 'down'
          : 'stable';
        return {
          name,
          unit: last.unit,
          count: pts.length,
          lastStatus: last.status,
          lastDate: last.date,
          lastValue: last.value,
          trend,
          statusPriority: statusPriorityOf(last.status),
        };
      })
      .sort((a, b) => {
        if (sortOrder === 'status' && a.statusPriority !== b.statusPriority)
          return a.statusPriority - b.statusPriority;
        return a.name.localeCompare(b.name, 'ro');
      });
  }, [analysisIndex, sortOrder]);

  const filtered = analysisList.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPoints = selectedName ? (analysisIndex.get(selectedName) ?? []) : [];
  const selectedMeta = analysisList.find(a => a.name === selectedName);

  const summaryStats = useMemo(() => {
    if (!selectedPoints.length) return null;
    const vals = selectedPoints.map(p => p.value);
    const avg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const last = selectedPoints[selectedPoints.length - 1];
    const inRange = selectedPoints.filter(p => p.status === 'Normal').length;
    return { avg, minVal, maxVal, last, inRange, total: selectedPoints.length };
  }, [selectedPoints]);

  function fmtDate(iso: string) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const STATUS_LABEL: Record<string, string> = {
    Normal: 'Normal', High: 'Ridicat', Low: 'Scăzut', Abnormal: 'Anormal',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Evoluție analize</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Urmărește tendința valorilor tale medicale în timp.</p>
      </div>

      {fetchError && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {fetchError}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center gap-5">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">Se încarcă datele...</p>
            {totalCount > 0 && (
              <p className="text-sm text-zinc-400 mt-1">{loadedCount} / {totalCount} înregistrări procesate</p>
            )}
          </div>
          {totalCount > 0 && (
            <div className="w-64 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((loadedCount / totalCount) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ) : allRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-5">
            <TrendingUp size={26} />
          </div>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Nicio dată disponibilă</p>
          <p className="text-sm text-zinc-400 mb-6 max-w-xs">Încarcă cel puțin o analiză cu dată de recoltare pentru a vizualiza tendința.</p>
          <Link to="/upload" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20">
            Încarcă PDF →
          </Link>
        </div>
      ) : analysisList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-5">
            <TrendingUp size={26} />
          </div>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Nicio analiză numerică</p>
          <p className="text-sm text-zinc-400 max-w-xs">Graficul evolutiv necesită analize cu valori numerice și dată de recoltare.</p>
        </div>
      ) : (
        <div className="flex gap-5 items-start">

          {/* ── Left panel ── */}
          <div className="w-72 shrink-0 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {analysisList.length} {analysisList.length === 1 ? 'analiză' : 'analize'}
                </p>
                {/* Sort toggle */}
                <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 text-xs">
                  <button
                    onClick={() => setSortOrder('alpha')}
                    className={`px-2.5 py-1 font-medium transition-colors ${sortOrder === 'alpha' ? 'bg-blue-600 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                  >A–Z</button>
                  <button
                    onClick={() => setSortOrder('status')}
                    className={`px-2.5 py-1 font-medium transition-colors border-l border-zinc-200 dark:border-zinc-700 ${sortOrder === 'status' ? 'bg-blue-600 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                  >⚠ Status</button>
                </div>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Caută analiză..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Analysis list */}
            <div className="overflow-y-auto max-h-[620px]">
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-zinc-400 py-8">Niciun rezultat.</p>
              ) : (
                filtered.map(item => {
                  const isSelected = selectedName === item.name;
                  const isAbnormal = item.lastStatus === 'High' || item.lastStatus === 'Abnormal';
                  const isLow = item.lastStatus === 'Low';
                  const dotCls = isAbnormal ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500';
                  const valueCls = isAbnormal
                    ? 'text-rose-600 dark:text-rose-400'
                    : isLow ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400';
                  const badgeCls = isAbnormal
                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : isLow ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
                  const TrendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
                  const trendCls = item.trend === 'up' ? 'text-rose-400' : item.trend === 'down' ? 'text-blue-400' : 'text-zinc-300 dark:text-zinc-600';

                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelectedName(item.name)}
                      className={`w-full text-left px-4 py-3.5 transition-all border-b border-zinc-50 dark:border-zinc-800/60 last:border-b-0 border-l-[3px] ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-500/10 border-l-blue-500'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-[7px] w-2 h-2 rounded-full shrink-0 ${dotCls}`} />
                        <div className="flex-1 min-w-0">
                          {/* Row 1: name + count */}
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <p className={`text-sm font-semibold leading-snug truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
                              {item.name}
                            </p>
                            <span className="shrink-0 text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md font-medium leading-none mt-0.5">
                              {item.count}×
                            </span>
                          </div>
                          {/* Row 2: value + status badge */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-base font-bold leading-none ${valueCls}`}>{item.lastValue}</span>
                            <span className="text-xs text-zinc-400">{item.unit}</span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${badgeCls}`}>
                              {STATUS_LABEL[item.lastStatus] ?? item.lastStatus}
                            </span>
                          </div>
                          {/* Row 3: date + trend */}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-400">{fmtDate(item.lastDate)}</p>
                            <TrendIcon size={13} className={trendCls} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {!selectedName ? (
              <div className="flex flex-col items-center justify-center h-[540px] text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-600 mb-4">
                  <TrendingUp size={30} />
                </div>
                <p className="font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Selectează o analiză</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-600 max-w-xs">
                  Alege o analiză din lista din stânga pentru a vizualiza graficul de evoluție.
                </p>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-zinc-900 dark:text-white text-xl leading-tight">{selectedName}</h2>
                      {selectedMeta && (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {selectedMeta.unit && (
                            <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-medium">
                              {selectedMeta.unit}
                            </span>
                          )}
                          <span className="text-xs text-zinc-400">
                            {selectedMeta.count} {selectedMeta.count === 1 ? 'înregistrare' : 'înregistrări'}
                          </span>
                          {selectedMeta.count >= 2 && (
                            <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                              selectedMeta.trend === 'up'
                                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
                                : selectedMeta.trend === 'down'
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
                                : 'text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                            }`}>
                              {selectedMeta.trend === 'up' ? <TrendingUp size={11} /> : selectedMeta.trend === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
                              {selectedMeta.trend === 'up' ? 'Tendință crescătoare' : selectedMeta.trend === 'down' ? 'Tendință descrescătoare' : 'Stabil'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary stats */}
                {summaryStats && (
                  <div className="grid grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20">
                    {/* Ultima valoare */}
                    <div className="px-5 py-4">
                      <p className="text-xs text-zinc-400 mb-1.5">Ultima valoare</p>
                      <p className={`text-xl font-bold leading-none ${
                        summaryStats.last.status === 'High' || summaryStats.last.status === 'Abnormal'
                          ? 'text-rose-600 dark:text-rose-400'
                          : summaryStats.last.status === 'Low'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>{summaryStats.last.value}</p>
                      <p className="text-xs text-zinc-400 mt-1">{summaryStats.last.unit}</p>
                    </div>
                    {/* Interval referinta */}
                    <div className="px-5 py-4">
                      <p className="text-xs text-zinc-400 mb-1.5">Interval de referință</p>
                      {(() => {
                        const { minRef, maxRef, referenceNote, unit } = summaryStats.last;
                        if (minRef !== null && maxRef !== null) {
                          return (
                            <>
                              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                                {minRef} – {maxRef}
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">{unit}</p>
                            </>
                          );
                        }
                        if (minRef !== null) {
                          return (
                            <>
                              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                                &gt; {minRef}
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">{unit}</p>
                            </>
                          );
                        }
                        if (maxRef !== null) {
                          return (
                            <>
                              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                                &lt; {maxRef}
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">{unit}</p>
                            </>
                          );
                        }
                        if (referenceNote) {
                          return (
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-snug mt-0.5 break-words">
                              {referenceNote}
                            </p>
                          );
                        }
                        return <p className="text-base text-zinc-400 leading-none mt-1">Necunoscut</p>;
                      })()}
                    </div>
                    {/* Media */}
                    <div className="px-5 py-4">
                      <p className="text-xs text-zinc-400 mb-1.5">Media</p>
                      <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 leading-none">{summaryStats.avg}</p>
                      <p className="text-xs text-zinc-400 mt-1">{summaryStats.last.unit}</p>
                    </div>
                    {/* In interval */}
                    <div className="px-5 py-4">
                      <p className="text-xs text-zinc-400 mb-1.5">Valori normale</p>
                      <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                        {summaryStats.inRange}/{summaryStats.total}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {Math.round(summaryStats.inRange / summaryStats.total * 100)}% din înregistrări
                      </p>
                    </div>
                  </div>
                )}

                {/* Chart */}
                <div className="px-5 pt-5 pb-4">
                  <EvolutionChart dataPoints={selectedPoints} analysisName={selectedName} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="/register" element={<RegisterPage onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
          <Sidebar onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('token'); }} />
          <main className="flex-1 overflow-y-auto min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/records/:id" element={<RecordDetailPage />} />
              <Route path="/evolution" element={<EvolutionPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}
export default App;

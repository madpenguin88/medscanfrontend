import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, AlertCircle, CheckCircle, Clock, FileIcon, X, ArrowRight, Sparkles, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { MedicalAnalysis } from '../types/medical';
import { useAnalysisParser } from '../hooks/useAnalysisParser';
import { AnalysisTable } from './AnalysisTable';

interface Props {
  onSave: (analyses: MedicalAnalysis[], file: File | null) => Promise<void>;
}

export function AnalysisUploader({ onSave }: Props) {
  const [analyses, setAnalyses] = useState<MedicalAnalysis[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [collectionDate, setCollectionDate] = useState('');
  const [laboratory, setLaboratory] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parsePDF, isParsing, error } = useAnalysisParser();

  const [loadingStep, setLoadingStep] = useState(0);

  const LOADING_STEPS = [
    'Se încarcă și se verifică documentul PDF...',
    'Se pregătesc paginile pentru analiză...',
    'Se trimite documentul la serverul AI MedScan...',
    'AI-ul extrage și interpretează valorile medicale...',
  ];

  const STEP_PROGRESS = [0, 18, 38, 58, 78];

  useEffect(() => {
    if (!isParsing) {
      setLoadingStep(0);
      return;
    }
    setLoadingStep(1);
    const t1 = setTimeout(() => setLoadingStep(2), 1800);
    const t2 = setTimeout(() => setLoadingStep(3), 4500);
    const t3 = setTimeout(() => setLoadingStep(4), 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isParsing]);

  const handleUpdateAnalysis = (id: string, field: keyof MedicalAnalysis, value: any) => {
    setAnalyses(analyses.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, [field]: value };
      if (field === 'value' || field === 'textValue') {
        const numVal = field === 'value' ? (value as number | null) : a.value;
        const min = updated.referenceRange?.min;
        const max = updated.referenceRange?.max;
        if (field === 'textValue') {
          // qualitative result — keep status as-is (user can see it's abnormal visually)
        } else if (numVal == null) {
          updated.status = 'Normal';
        } else if (max != null && numVal > max) {
          updated.status = 'High';
        } else if (min != null && min !== 0 && numVal < min) {
          updated.status = 'Low';
        } else if (max != null || min != null) {
          updated.status = 'Normal';
        }
      }
      return updated;
    }));
  };

  const handleRemoveAnalysis = (id: string) => {
    setAnalyses(analyses.filter(a => a.id !== id));
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') { alert('Te rugăm să încarci doar fișiere PDF.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Fișierul este prea mare. Maxim 10MB.'); return; }
    setAnalyses([]);
    setSaveError('');
    setSavedCount(0);
    setCurrentFile(file);
    const extracted = await parsePDF(file);
    setAnalyses(extracted);
    if (extracted.length > 0 && extracted[0].collectionDate && !collectionDate) {
      const raw = extracted[0].collectionDate.trim();
      const ddmmyyyy = raw.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
      if (ddmmyyyy) {
        setCollectionDate(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        setCollectionDate(raw);
      } else if (raw.length > 0) {
        // Unknown format — pass raw and let backend try to parse it
        setCollectionDate(raw);
      }
    }
    if (extracted.length > 0 && extracted[0].laboratory && !laboratory) {
      setLaboratory(extracted[0].laboratory);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleSave = async () => {
    const validAnalyses = analyses.filter(a => a.name.trim() !== '' && (a.value !== null || !!a.textValue));
    if (validAnalyses.length === 0) return;

    const finalized = validAnalyses.map(a => ({
      ...a,
      collectionDate: collectionDate || undefined,
      laboratory: laboratory || undefined
    }));

    setIsSaving(true);
    setSaveError('');
    try {
      await onSave(finalized, currentFile);
      // Reset state & show toast only on success
      setAnalyses([]);
      setCollectionDate('');
      setLaboratory('');
      setCurrentFile(null);
      setSavedCount(finalized.length);
    } catch {
      setSaveError('Eroare la salvarea analizelor. Încearcă din nou.');
    } finally {
      setIsSaving(false);
    }
  };

  const isValidToSave = analyses.some(a => a.name.trim() !== '' && (a.value !== null || !!a.textValue)) && !isSaving;
  const fileSizeKB = currentFile ? (currentFile.size / 1024).toFixed(0) : null;

  return (
    <div className="space-y-4">
      {/* Post-save success panel */}
      <AnimatePresence>
        {savedCount > 0 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.15 }}
                >
                  <CheckCircle size={22} className="text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                  {savedCount} analiz{savedCount === 1 ? 'ă salvată' : 'e salvate'} cu succes
                </p>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
                  Mergi la Dashboard și generează raportul AI pentru a vedea interpretarea completă.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles size={14} />
                  Generează raport AI
                </Link>
                <button
                  onClick={() => setSavedCount(0)}
                  className="px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-emerald-100/60 dark:bg-emerald-900/20 border-t border-emerald-200/60 dark:border-emerald-500/20 flex items-start gap-2">
              <Home size={12} className="text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700/80 dark:text-emerald-500">
                Pe Dashboard apasă <strong>„Generează Raport AI"</strong> — MedScan va analiza toate rapoartele salvate și va crea un rezumat personalizat al stării tale de sănătate.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Metadata + save bar — shown once analyses are loaded */}
        {analyses.length > 0 && (
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              {collectionDate && (
                <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Data recoltării</span>
                  <span className="font-medium">{(() => { const d = new Date(collectionDate + 'T00:00:00'); return !isNaN(d.getTime()) ? d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' }) : collectionDate; })()}</span>
                </div>
              )}
              {laboratory && (
                <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Laborator</span>
                  <span className="font-medium">{laboratory}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {saveError && <span className="text-xs text-rose-500">{saveError}</span>}
              <div className="relative">
                {isValidToSave && !isSaving && !isParsing && (
                  <span className="absolute inset-0 rounded-xl bg-blue-500 animate-ping opacity-25 pointer-events-none" />
                )}
                <button
                  disabled={!isValidToSave || isParsing || isSaving}
                  onClick={handleSave}
                  className="relative px-6 py-2.5 bg-blue-600 hover:bg-blue-700 hover:scale-[1.04] active:scale-[0.97] disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white rounded-xl font-semibold transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 disabled:shadow-none flex items-center gap-2 text-sm"
                >
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Se salvează...</>
                  ) : (
                    `Salvează ${analyses.filter(a => a.name.trim() !== '').length} analize`
                  )}
                  {!isSaving && <ArrowRight size={15} />}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Drop zone — shown when no file is loaded and not parsing */}
          {!isParsing && analyses.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-900/10'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-200 ${
                isDragging ? 'bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400 scale-110' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}>
                <UploadCloud size={28} />
              </div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                {isDragging ? 'Eliberează pentru a încărca' : 'Trage PDF-ul aici sau click pentru a selecta'}
              </p>
              <p className="text-sm text-zinc-500 mb-5">Fișiere PDF acceptate · Maxim 10MB</p>
              <button
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20"
              >
                Alege fișier PDF
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileInput} />
            </div>
          )}

          {/* File loaded strip */}
          {!isParsing && analyses.length > 0 && currentFile && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl">
                <FileIcon size={13} className="text-blue-500 shrink-0" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate max-w-[200px]">{currentFile.name}</span>
                <span className="text-xs text-blue-500/60">{fileSizeKB} KB</span>
              </div>
              <button
                onClick={() => { setAnalyses([]); setCurrentFile(null); setCollectionDate(''); setLaboratory(''); setSaveError(''); }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <X size={12} /> Șterge
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
              >
                <UploadCloud size={12} /> Alt PDF
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileInput} />
            </div>
          )}

          {/* Loading panel */}
          {isParsing && (
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 p-6 mb-2">
              {currentFile && (
                <div className="flex items-center gap-2 mb-4">
                  <FileIcon size={13} className="text-blue-400 shrink-0" />
                  <span className="text-xs text-blue-600/70 dark:text-blue-400/70 truncate">{currentFile.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Se procesează documentul...</span>
                </div>
                <span className="text-xs text-zinc-400 tabular-nums">{Math.min(loadingStep, LOADING_STEPS.length)} / {LOADING_STEPS.length}</span>
              </div>
              <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-in-out bg-blue-500 ${loadingStep === 4 ? 'animate-pulse' : ''}`}
                  style={{ width: `${STEP_PROGRESS[loadingStep] ?? 0}%` }}
                />
              </div>
              <div className="space-y-3">
                {LOADING_STEPS.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isDone = loadingStep > stepNum;
                  const isCurrent = loadingStep === stepNum;
                  const isPending = loadingStep < stepNum;
                  return (
                    <div key={idx} className={`flex items-center gap-3 text-sm transition-all duration-300 ${isPending ? 'opacity-35' : ''}`}>
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        {isDone ? (
                          <CheckCircle size={16} className="text-emerald-500" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
                        )}
                      </div>
                      <span className={isCurrent ? 'font-medium text-zinc-800 dark:text-zinc-200' : isDone ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-400 dark:text-zinc-600'}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-zinc-500">
                <Clock size={13} className="shrink-0 mt-0.5 text-zinc-400" />
                <span>
                  Analizarea cu AI poate dura{' '}
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">1–2 minute</span>,
                  în funcție de numărul de pagini și densitatea informației.
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm text-rose-600 dark:text-rose-400 mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* Table */}
          <AnalysisTable
            analyses={analyses}
            editable={true}
            onUpdate={handleUpdateAnalysis}
            onRemove={handleRemoveAnalysis}
          />
        </div>
      </div>


    </div>
  );
}

import type { MedicalAnalysis } from '../types/medical';
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  analyses: MedicalAnalysis[];
  editable?: boolean;
  onUpdate?: (id: string, field: keyof MedicalAnalysis, value: any) => void;
  onRemove?: (id: string) => void;
}

const STATUS_CONFIG = {
  High:     { label: 'Ridicat',  cls: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-400/10',     Icon: TrendingUp   },
  Low:      { label: 'Scăzut',   cls: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10', Icon: TrendingDown  },
  Abnormal: { label: 'Anormal',  cls: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-400/10',     Icon: TrendingUp   },
  Normal:   { label: 'Normal',   cls: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10', Icon: Minus },
} as const;

function formatRefLabel(item: MedicalAnalysis): string | null {
  if (item.referenceRange) {
    const { min, max } = item.referenceRange;
    if (min !== undefined && max !== undefined) return `${min} – ${max}`;
    if (max !== undefined) return `< ${max}`;
    if (min !== undefined) return `> ${min}`;
  }
  // referenceNote is now always the patient-specific short interval (set by backend)
  if (item.referenceNote && item.referenceNote.trim().length > 0) {
    return item.referenceNote.trim();
  }
  return null;
}

export function AnalysisTable({ analyses, editable = false, onUpdate, onRemove }: Props) {
  if (analyses.length === 0) return null;

  const abnormalCount = analyses.filter(
    a => a.status === 'High' || a.status === 'Low' || a.status === 'Abnormal',
  ).length;

  return (
    <div className="mt-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{analyses.length}</span> analize extrase
        </span>
        {abnormalCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-400/10 px-3 py-1 rounded-full">
            <TrendingUp size={11} strokeWidth={2.5} />
            {abnormalCount} în afara limitelor
          </span>
        )}
      </div>

      {/* ── Mobile card list (< sm) ── */}
      <div className="sm:hidden rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950">
        {analyses.map((item, idx) => {
          const st = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
          const isAbnormal = item.status === 'High' || item.status === 'Low' || item.status === 'Abnormal';
          const isLow = item.status === 'Low';
          const borderCls = isAbnormal && !isLow
            ? 'border-l-rose-400'
            : isLow
            ? 'border-l-amber-400'
            : 'border-l-transparent';
          const refLabel = formatRefLabel(item);
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 px-4 py-3.5 border-l-[3px] ${borderCls} ${isAbnormal ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''}`}
            >
              <span className="mt-0.5 w-5 text-xs text-zinc-400 tabular-nums shrink-0 text-right">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  {editable ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => onUpdate?.(item.id, 'name', e.target.value)}
                      className="flex-1 bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 font-medium text-zinc-900 dark:text-zinc-100 text-sm"
                    />
                  ) : (
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-snug">{item.name}</span>
                  )}
                  {st && (
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>
                      <st.Icon size={10} strokeWidth={2.5} />
                      {st.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {editable ? (
                    item.textValue != null ? (
                      <input
                        type="text"
                        value={item.textValue}
                        onChange={e => onUpdate?.(item.id, 'textValue', e.target.value)}
                        className="bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-200 w-24"
                      />
                    ) : (
                      <input
                        type="number"
                        value={item.value ?? ''}
                        onChange={e => onUpdate?.(item.id, 'value', e.target.value === '' ? null : parseFloat(e.target.value))}
                        className="bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-200 w-20"
                      />
                    )
                  ) : (
                    <span className={`text-sm font-semibold tabular-nums ${isAbnormal ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {item.textValue ?? item.value ?? '—'}
                    </span>
                  )}
                  {editable ? (
                    <input
                      type="text"
                      value={item.unit}
                      onChange={e => onUpdate?.(item.id, 'unit', e.target.value)}
                      className="bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-xs text-zinc-500 w-16"
                    />
                  ) : (
                    item.unit && <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.unit}</span>
                  )}
                  {refLabel && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">ref: {refLabel}</span>
                  )}
                </div>
              </div>
              {editable && (
                <button
                  onClick={() => onRemove?.(item.id)}
                  className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                  title="Șterge"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (sm+) ── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
              <th className="pl-5 pr-3 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-10 select-none">#</th>
              <th className="px-3 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Analiză</th>
              <th className="px-3 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Rezultat</th>
              <th className="px-3 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">U.M.</th>
              <th className="px-3 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Interval Ref.</th>
              <th className="px-3 pr-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              {editable && <th className="px-3 py-3 w-12" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950">
            {analyses.map((item, idx) => {
              const st = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
              const isAbnormal = item.status === 'High' || item.status === 'Low' || item.status === 'Abnormal';
              return (
                <tr
                  key={item.id}
                  className={`group transition-colors duration-100 ${
                    isAbnormal
                      ? 'bg-rose-50/30 dark:bg-rose-950/20'
                      : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  <td className="pl-5 pr-3 py-3.5 text-xs text-zinc-400 tabular-nums select-none">{idx + 1}</td>
                  <td className="px-3 py-3.5">
                    {editable ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => onUpdate?.(item.id, 'name', e.target.value)}
                        className="w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 font-medium text-zinc-900 dark:text-zinc-100"
                      />
                    ) : (
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    {editable ? (
                      item.textValue != null ? (
                        <input
                          type="text"
                          value={item.textValue}
                          onChange={e => onUpdate?.(item.id, 'textValue', e.target.value)}
                          className="w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                        />
                      ) : (
                        <input
                          type="number"
                          value={item.value ?? ''}
                          onChange={e => onUpdate?.(item.id, 'value', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-28 bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 tabular-nums"
                        />
                      )
                    ) : (
                      <span className={`font-semibold tabular-nums ${isAbnormal ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {item.textValue ?? item.value ?? '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    {editable ? (
                      <input
                        type="text"
                        value={item.unit}
                        onChange={e => onUpdate?.(item.id, 'unit', e.target.value)}
                        className="w-24 bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-zinc-500"
                      />
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs">{item.unit || '—'}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 max-w-[200px]">
                    {(() => {
                      const ref = formatRefLabel(item);
                      return ref
                        ? <span className="text-zinc-500 dark:text-zinc-400 text-xs font-mono tabular-nums">{ref}</span>
                        : <span className="text-zinc-300 dark:text-zinc-700">—</span>;
                    })()}
                  </td>
                  <td className="px-3 pr-5 py-3.5">
                    {st ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
                        <st.Icon size={11} strokeWidth={2.5} />
                        {st.label}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700 text-xs">—</span>
                    )}
                  </td>
                  {editable && (
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => onRemove?.(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        title="Șterge"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

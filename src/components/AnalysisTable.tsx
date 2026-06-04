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

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
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
                    {item.referenceRange ? (
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs font-mono tabular-nums">
                        {item.referenceRange.min !== undefined && item.referenceRange.max !== undefined
                          ? `${item.referenceRange.min} – ${item.referenceRange.max}`
                          : item.referenceRange.max !== undefined
                          ? `< ${item.referenceRange.max}`
                          : `> ${item.referenceRange.min}`}
                      </span>
                    ) : item.referenceNote ? (
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs font-mono" title={item.referenceNote}>
                        {item.referenceNote.length > 28 ? item.referenceNote.substring(0, 28) + '…' : item.referenceNote}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">—</span>
                    )}
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
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
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

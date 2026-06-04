import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

export interface EvolutionDataPoint {
  date: string;        // ISO yyyy-mm-dd
  value: number;
  unit: string;
  minRef: number | null;
  maxRef: number | null;
  referenceNote?: string | null;
  status: string;
  laboratory: string | null;
  recordId: number;
}

interface Props {
  dataPoints: EvolutionDataPoint[];
  analysisName: string;
}

const STATUS_RO: Record<string, string> = {
  Normal: 'Normal',
  High: 'Ridicat',
  Low: 'Scăzut',
  Abnormal: 'Anormal',
};

function dotColor(status: string): string {
  if (status === 'High' || status === 'Abnormal') return '#f43f5e';
  if (status === 'Low') return '#f59e0b';
  return '#10b981';
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  const fill = dotColor(payload.status);
  return (
    <circle cx={cx} cy={cy} r={7} fill={fill} stroke="white" strokeWidth={2.5}
      style={{ filter: `drop-shadow(0 1px 4px ${fill}70)` }} />
  );
}

function CustomActiveDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  const fill = dotColor(payload.status);
  return (
    <circle cx={cx} cy={cy} r={10} fill={fill} stroke="white" strokeWidth={3}
      style={{ filter: `drop-shadow(0 2px 6px ${fill}90)` }} />
  );
}

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ payload: EvolutionDataPoint }>;
}

function CustomTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload as EvolutionDataPoint;
  const statusLabel = STATUS_RO[d.status] ?? d.status;
  const isAbnormal = d.status === 'High' || d.status === 'Abnormal';
  const isLow = d.status === 'Low';
  const statusCls = isAbnormal
    ? 'text-rose-600 bg-rose-50 border-rose-200'
    : isLow
    ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  let deviation = '';
  if (d.maxRef !== null && d.maxRef !== 0 && d.value > d.maxRef)
    deviation = `+${((d.value - d.maxRef) / d.maxRef * 100).toFixed(1)}% peste limita superioară`;
  else if (d.minRef !== null && d.minRef !== 0 && d.value < d.minRef)
    deviation = `-${((d.minRef - d.value) / d.minRef * 100).toFixed(1)}% sub limita inferioară`;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl px-4 py-3.5 min-w-[200px] text-sm">
      <p className="font-bold text-zinc-900 text-xl leading-none mb-0.5">
        {d.value}<span className="text-zinc-400 font-normal text-sm ml-1.5">{d.unit}</span>
      </p>
      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mt-1.5 mb-2 ${statusCls}`}>
        {statusLabel}
      </span>
      {deviation && (
        <p className="text-xs text-zinc-500 mb-2">{deviation}</p>
      )}
      <p className="text-xs text-zinc-500">{formatDate(d.date)}</p>
      {d.laboratory && <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[190px]">{d.laboratory}</p>}
      {(d.minRef !== null || d.maxRef !== null) && (
        <p className="text-xs text-zinc-400 mt-2 pt-2 border-t border-zinc-100">
          Referință:{' '}
          {d.minRef !== null && d.maxRef !== null
            ? `${d.minRef} – ${d.maxRef}`
            : d.maxRef !== null
            ? `< ${d.maxRef}`
            : `> ${d.minRef}`}{' '}
          {d.unit}
        </p>
      )}
    </div>
  );
}

export function EvolutionChart({ dataPoints, analysisName }: Props) {
  if (dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">
        Nicio valoare numerică disponibilă.
      </div>
    );
  }

  const sorted = [...dataPoints].sort((a, b) => a.date.localeCompare(b.date));
  const unit = sorted[0].unit;

  const values = sorted.map(p => p.value);
  const allWithMinRef = sorted.filter(p => p.minRef !== null);
  const allWithMaxRef = sorted.filter(p => p.maxRef !== null);
  const refMin = allWithMinRef.length > 0 ? Math.min(...allWithMinRef.map(p => p.minRef!)) : null;
  const refMax = allWithMaxRef.length > 0 ? Math.max(...allWithMaxRef.map(p => p.maxRef!)) : null;
  const refVals = [...(refMin !== null ? [refMin] : []), ...(refMax !== null ? [refMax] : [])];
  const allForScale = refVals.length > 0 ? [...values, ...refVals] : values;
  const yMin = Math.min(...allForScale);
  const yMax = Math.max(...allForScale);
  const padding = (yMax - yMin) * 0.25 || 2;
  const domainMin = Math.max(0, parseFloat((yMin - padding).toFixed(2)));
  const domainMax = parseFloat((yMax + padding).toFixed(2));

  const isSinglePoint = sorted.length === 1;

  return (
    <div>
      {isSinglePoint && (
        <div className="mb-4 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <span className="font-bold">i</span>
          O singură înregistrare — încarcă mai multe analize pentru a vedea tendința.
        </div>
      )}

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={sorted} margin={{ top: 16, right: 28, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#f4f4f5" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            tickLine={false}
            axisLine={false}
            dy={8}
          />

          <YAxis
            domain={[domainMin, domainMax]}
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            tickLine={false}
            axisLine={false}
            width={54}
            tickFormatter={(v: number) => String(v)}
            label={unit ? { value: unit, angle: -90, position: 'insideLeft', offset: 14, fontSize: 10, fill: '#a1a1aa' } : undefined}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#e4e4e7', strokeWidth: 1.5, strokeDasharray: '4 2' }}
          />

          {(refMin !== null || refMax !== null) && (
            <ReferenceArea y1={refMin ?? domainMin} y2={refMax ?? domainMax} fill="#10b981" fillOpacity={0.18} stroke="none" />
          )}

          {refMax !== null && (
            <ReferenceLine y={refMax} stroke="#10b981" strokeDasharray="6 3" strokeOpacity={0.8} strokeWidth={2} />
          )}
          {refMin !== null && (
            <ReferenceLine y={refMin} stroke="#10b981" strokeDasharray="6 3" strokeOpacity={0.8} strokeWidth={2} />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={<CustomActiveDot />}
            name={analysisName}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-2 px-2 text-xs text-zinc-400 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Ridicat / Anormal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Scăzut
        </span>
        {(refMin !== null || refMax !== null) && (
          <span className="flex items-center gap-1.5 text-emerald-500 opacity-70">
            <span className="w-5 border-t-2 border-dashed border-emerald-500 inline-block" />
            Interval de referință
          </span>
        )}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: Array<{ label: string; value: number; max?: number }>;
  unit?: string;
}

export function BarChart({ data, unit = "%" }: BarChartProps) {
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const max = d.max ?? 100;
        const pct = Math.max(0, Math.min(100, (d.value / max) * 100));
        return (
          <div key={d.label}>
            <div className="mb-1 flex justify-between text-xs text-slate-600">
              <span className="font-medium">{d.label}</span>
              <span>
                {d.value}
                {unit}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={d.value}
              aria-label={d.label}
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimulationPoint } from "@/lib/types";
import {
  formatCompactEUR,
  formatDateLong,
  formatEUR,
  formatMonthShort,
} from "@/lib/format";

interface PortfolioChartProps {
  series: SimulationPoint[];
  height?: number;
}

/** Réduit la série à ~`max` points pour un rendu fluide (en gardant les bornes). */
function downsample(series: SimulationPoint[], max = 160): SimulationPoint[] {
  if (series.length <= max) return series;
  const step = Math.ceil(series.length / max);
  const out: SimulationPoint[] = [];
  for (let i = 0; i < series.length; i += step) out.push(series[i]);
  const last = series[series.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

interface TooltipPayload {
  payload: SimulationPoint;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-white/10 bg-surface-base/95 px-3 py-2 shadow-card backdrop-blur">
      <div className="mb-1 text-[11px] font-semibold text-ink-muted">
        {formatDateLong(point.date)}
      </div>
      <div className="flex items-center gap-2 text-[12px]">
        <span className="h-[3px] w-3 rounded-full bg-brand-graph" />
        <span className="text-ink-soft">Valeur</span>
        <span className="tnum ml-auto font-bold text-ink">
          {formatEUR(point.value)}
        </span>
      </div>
      <div className="mt-0.5 flex items-center gap-2 text-[12px]">
        <span className="h-0 w-3 border-t-2 border-dashed border-brand-gold" />
        <span className="text-ink-soft">Cumul investi</span>
        <span className="tnum ml-auto font-bold text-ink">
          {formatEUR(point.invested)}
        </span>
      </div>
    </div>
  );
}

export function PortfolioChart({ series, height = 280 }: PortfolioChartProps) {
  const gradientId = useId();
  const data = useMemo(() => downsample(series), [series]);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: -8 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B9AF0" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#3B9AF0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatMonthShort}
            tick={{ fill: "#5E6A87", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={formatCompactEUR}
            tick={{ fill: "#5E6A87", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickCount={4}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B9AF0"
            strokeWidth={2.6}
            fill={`url(#${gradientId})`}
            activeDot={{
              r: 4.5,
              fill: "#3B9AF0",
              stroke: "#0E1426",
              strokeWidth: 2.5,
            }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="invested"
            stroke="#F2C230"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

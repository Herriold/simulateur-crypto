"use client";

import { ArrowDownRight, ArrowUpRight, PlayCircle } from "lucide-react";
import { PortfolioChart } from "./PortfolioChart";
import {
  formatEUR,
  formatMonthLong,
  formatSignedEUR,
  formatSignedPct,
} from "@/lib/format";
import type {
  DcaFrequency,
  InvestmentMode,
  SimulationResult,
} from "@/lib/types";

const FREQ_WORD: Record<DcaFrequency, string> = {
  daily: "jour",
  weekly: "semaine",
  monthly: "mois",
};

interface ResultsPanelProps {
  result: SimulationResult;
  mode: InvestmentMode;
  frequency: DcaFrequency;
  amount: string;
  startDate: string;
  endDate: string;
}

function monthsBetween(start: string, end: string): number {
  const [ys, ms] = start.split("-").map(Number);
  const [ye, me] = end.split("-").map(Number);
  return Math.max(0, (ye - ys) * 12 + (me - ms));
}

/**
 * Barre de composition (signature S'investir) : part « somme investie » (bleu)
 * vs plus-value (or) — ou moins-value (rouge) quand la valeur finale est sous
 * le capital investi.
 */
function CompositionBar({
  invested,
  finalValue,
  pnl,
}: {
  invested: number;
  finalValue: number;
  pnl: number;
}) {
  const positive = pnl >= 0;
  let bluePct: number;
  let accentPct: number;
  if (positive) {
    bluePct = finalValue > 0 ? (invested / finalValue) * 100 : 100;
    accentPct = 100 - bluePct;
  } else {
    bluePct = invested > 0 ? (finalValue / invested) * 100 : 0;
    accentPct = 100 - bluePct;
  }
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <span style={{ width: `${bluePct}%` }} className="block bg-brand-graph" />
      <span
        style={{ width: `${accentPct}%` }}
        className={positive ? "block bg-brand-gold" : "block bg-danger"}
      />
    </div>
  );
}

export function ResultsPanel({
  result,
  mode,
  frequency,
  amount,
  startDate,
  endDate,
}: ResultsPanelProps) {
  const positive = result.pnl >= 0;
  const pnlColor = positive ? "#2ECC71" : "#DD5033";
  const glow = positive ? "rgba(46,204,113,.16)" : "rgba(221,80,51,.16)";
  const pnlBg = positive ? "rgba(46,204,113,.12)" : "rgba(221,80,51,.12)";
  const pnlBorder = positive ? "rgba(46,204,113,.3)" : "rgba(221,80,51,.3)";

  const isDca = mode === "dca";
  const horizon = monthsBetween(startDate, endDate);
  const contribNote = isDca
    ? `${formatEUR(Number(amount) || 0)} / ${FREQ_WORD[frequency]}`
    : "Achat unique au départ";

  const ArrowIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex flex-col gap-5">
      {/* En-tête de section */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-brand" />
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Vos résultats</h2>
        </div>
        <span className="pointer-events-none inline-flex select-none items-center gap-2 rounded-full bg-gradient-to-b from-brand-light to-brand px-4 py-2 text-[12.5px] font-bold text-white shadow-[0_6px_18px_rgba(37,117,232,.35)]">
          <PlayCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Voir notre vidéo tuto</span>
          <span className="sm:hidden">Tuto</span>
        </span>
      </div>

      {/* Hero — plus-value + composition */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-surface-card to-[#0A0F22] p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-ink-soft">
              Plus-value estimée
            </div>
            <div
              className="tnum mt-2 text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-[52px]"
              style={{ color: pnlColor }}
            >
              {formatSignedEUR(result.pnl)}
            </div>
            <div
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-[7px]"
              style={{ background: pnlBg, border: `1px solid ${pnlBorder}` }}
            >
              <ArrowIcon className="h-3.5 w-3.5" style={{ color: pnlColor }} />
              <span className="tnum text-sm font-bold" style={{ color: pnlColor }}>
                {formatSignedPct(result.pnlPct)}
              </span>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold text-ink-muted">
              Horizon · {horizon} mois
            </div>
            <div className="mt-1 text-sm font-bold text-ink-cool">
              {formatMonthLong(startDate)} → {formatMonthLong(endDate)}
            </div>
          </div>
        </div>

        {/* Composition de la valeur finale */}
        <div className="relative mt-6">
          <div className="mb-2 flex items-center justify-between text-[12.5px]">
            <span className="flex items-center gap-2 font-semibold text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-graph" />
              Somme investie
              <span className="tnum font-bold text-ink">
                {formatEUR(result.totalInvested)}
              </span>
            </span>
            <span className="flex items-center gap-2 font-semibold text-ink-soft">
              {positive ? "Plus-value" : "Moins-value"}
              <span
                className="tnum font-bold"
                style={{ color: positive ? "#F2C230" : "#DD5033" }}
              >
                {formatSignedEUR(result.pnl)}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-sm ${positive ? "bg-brand-gold" : "bg-danger"}`}
              />
            </span>
          </div>
          <CompositionBar
            invested={result.totalInvested}
            finalValue={result.finalValue}
            pnl={result.pnl}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.08] bg-surface-card p-5 sm:px-6 sm:py-[22px]">
          <div className="flex items-center gap-2.5">
            <span className="h-[9px] w-[9px] rounded-[3px] bg-brand-graph" />
            <span className="text-[12.5px] font-semibold text-ink-soft">
              Montant total investi
            </span>
          </div>
          <div className="tnum mt-3 text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
            {formatEUR(result.totalInvested)}
          </div>
          <div className="mt-1.5 text-xs font-medium text-ink-muted">
            {contribNote}
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-surface-card p-5 sm:px-6 sm:py-[22px]">
          <div className="flex items-center gap-2.5">
            <span className="h-[9px] w-[9px] rounded-[3px] bg-brand-gold" />
            <span className="text-[12.5px] font-semibold text-ink-soft">
              Valeur finale du portefeuille
            </span>
          </div>
          <div className="tnum mt-3 text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
            {formatEUR(result.finalValue)}
          </div>
          <div className="mt-1.5 text-xs font-medium text-ink-muted">
            au {formatMonthLong(endDate)}
          </div>
        </div>
      </div>

      {/* Graphe */}
      <div className="rounded-lg border border-white/[0.08] bg-surface-card px-4 pb-3 pt-5 sm:px-6">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14.5px] font-bold text-ink">
            Évolution du portefeuille
          </span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-[3px] w-3.5 rounded-full bg-brand-graph" />
              <span className="text-xs font-semibold text-ink-soft">Valeur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0 w-3.5 border-t-2 border-dashed border-brand-gold" />
              <span className="text-xs font-semibold text-ink-soft">
                Cumul investi
              </span>
            </div>
          </div>
        </div>
        <PortfolioChart series={result.series} />
      </div>
    </div>
  );
}

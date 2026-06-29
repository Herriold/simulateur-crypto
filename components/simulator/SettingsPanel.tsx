"use client";

import type { ReactNode } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COINS } from "@/lib/coins";
import type { CoinId, DcaFrequency, InvestmentMode } from "@/lib/types";

const MODE_OPTIONS: { key: InvestmentMode; label: string; desc: string }[] = [
  { key: "oneshot", label: "One-shot", desc: "Achat unique" },
  { key: "dca", label: "DCA", desc: "Investissement programmé" },
];

const FREQ_OPTIONS: { key: DcaFrequency; label: string; short: string }[] = [
  { key: "daily", label: "Quotidienne", short: "Quot." },
  { key: "weekly", label: "Hebdomadaire", short: "Hebdo" },
  { key: "monthly", label: "Mensuelle", short: "Mens." },
];

const FREQ_WORD: Record<DcaFrequency, string> = {
  daily: "jour",
  weekly: "semaine",
  monthly: "mois",
};

interface SettingsPanelProps {
  coins: CoinId[];
  coin: CoinId;
  amount: string;
  mode: InvestmentMode;
  frequency: DcaFrequency;
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  onCoinChange: (coin: CoinId) => void;
  onAmountChange: (value: string) => void;
  onModeChange: (mode: InvestmentMode) => void;
  onFrequencyChange: (frequency: DcaFrequency) => void;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onSubmit?: () => void;
}

/** Label de champ avec icône (i) — signature charte S'investir. */
function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint: string;
}) {
  return (
    <span className="mb-[9px] flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-soft">
      {children}
      <span title={hint} className="cursor-help text-ink-faint">
        <Info className="h-3 w-3" />
      </span>
    </span>
  );
}

function CoinDot({ coin, size = 28 }: { coin: CoinId; size?: number }) {
  const meta = COINS[coin];
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full font-bold text-black"
      style={{
        width: size,
        height: size,
        background: meta.color,
        fontSize: size * 0.5,
      }}
    >
      {meta.symbol}
    </span>
  );
}

export function SettingsPanel(props: SettingsPanelProps) {
  const {
    coins,
    coin,
    amount,
    mode,
    frequency,
    startDate,
    endDate,
    minDate,
    maxDate,
  } = props;
  const selected = COINS[coin];
  const isDca = mode === "dca";
  const amountLabel = isDca
    ? `Montant par ${FREQ_WORD[frequency]}`
    : "Montant investi";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-surface-card to-[#0A0F22] p-5 shadow-card sm:p-[26px]">
      <h2 className="mb-[22px] text-base font-bold text-ink">Paramètres</h2>

      {/* Crypto-actif */}
      <div className="mb-5">
        <FieldLabel hint="La crypto-actif sur laquelle porte la simulation.">
          Crypto-actif
        </FieldLabel>
        <div className="flex items-center gap-3 rounded-md border border-white/[0.12] bg-surface-input px-3.5 py-3">
          <CoinDot coin={coin} />
          <div className="flex-1">
            <div className="text-sm font-bold text-ink">{selected.name}</div>
          </div>
          <span className="tnum text-[12.5px] font-semibold text-ink-muted">
            {selected.ticker}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
        </div>

        <div
          className="mt-2.5 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${coins.length}, minmax(0, 1fr))` }}
        >
          {coins.map((id) => {
            const meta = COINS[id];
            const active = id === coin;
            return (
              <button
                key={id}
                type="button"
                onClick={() => props.onCoinChange(id)}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border px-2 py-2 transition-[filter] hover:brightness-110",
                  active
                    ? "border-brand-light/60 bg-brand/[0.16]"
                    : "border-white/10 bg-surface-input",
                )}
              >
                <span
                  className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[10px] font-bold text-black"
                  style={{ background: meta.color }}
                >
                  {meta.symbol}
                </span>
                <span
                  className={cn(
                    "tnum text-[11.5px] font-bold",
                    active ? "text-ink-blue" : "text-ink-cool",
                  )}
                >
                  {meta.ticker}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Montant */}
      <div className="mb-5">
        <FieldLabel
          hint={
            isDca
              ? "Montant versé à chaque échéance (DCA)."
              : "Montant investi en une seule fois au départ."
          }
        >
          {amountLabel}
        </FieldLabel>
        <div className="flex items-center rounded-md border border-white/[0.12] bg-surface-input px-3.5">
          <input
            className="tnum no-spin w-full flex-1 border-none bg-transparent py-3 text-[22px] font-bold text-ink outline-none"
            value={amount}
            onChange={(e) =>
              props.onAmountChange(e.target.value.replace(/[^0-9]/g, ""))
            }
            inputMode="numeric"
            placeholder="0"
            aria-label={amountLabel}
          />
          <span className="text-lg font-bold text-ink-muted">€</span>
        </div>
      </div>

      {/* Mode */}
      <div className="mb-[18px]">
        <FieldLabel hint="One-shot : un achat unique. DCA : des apports réguliers.">
          Mode d&apos;investissement
        </FieldLabel>
        <div className="flex gap-1.5 rounded-md border border-white/10 bg-surface-input p-[5px]">
          {MODE_OPTIONS.map((m) => {
            const active = m.key === mode;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => props.onModeChange(m.key)}
                className={cn(
                  "flex-1 cursor-pointer rounded-[9px] px-2 py-[11px] text-center transition-all",
                  active
                    ? "bg-gradient-to-b from-brand-light to-brand shadow-[0_6px_16px_rgba(22,104,227,.4)]"
                    : "hover:bg-white/5",
                )}
              >
                <div
                  className={cn(
                    "text-[13px] font-bold",
                    active ? "text-white" : "text-ink-cool",
                  )}
                >
                  {m.label}
                </div>
                <div
                  className={cn(
                    "mt-0.5 text-[11px] font-medium",
                    active ? "text-white/75" : "text-ink-muted",
                  )}
                >
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fréquence (DCA uniquement) */}
      {isDca && (
        <div className="mb-[18px] animate-fade-up">
          <FieldLabel hint="Périodicité des apports en mode DCA.">
            Fréquence
          </FieldLabel>
          <div className="flex gap-1.5">
            {FREQ_OPTIONS.map((f) => {
              const active = f.key === frequency;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => props.onFrequencyChange(f.key)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-[10px] border px-2 py-2.5 text-center text-[12.5px] font-semibold transition-[filter] hover:brightness-110",
                    active
                      ? "border-brand-light/60 bg-brand/[0.16] text-ink-blue"
                      : "border-white/10 bg-surface-input text-ink-soft",
                  )}
                >
                  <span className="hidden sm:inline">{f.label}</span>
                  <span className="sm:hidden">{f.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-[9px] block text-[12.5px] font-semibold text-ink-soft">
            Début
          </label>
          <input
            type="date"
            value={startDate}
            min={minDate}
            max={endDate}
            onChange={(e) => props.onStartChange(e.target.value)}
            className="w-full rounded-md border border-white/[0.12] bg-surface-input px-3 py-3 text-[13.5px] font-semibold text-ink outline-none focus:border-brand-light/60"
          />
        </div>
        <div>
          <label className="mb-[9px] block text-[12.5px] font-semibold text-ink-soft">
            Fin
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={maxDate}
            onChange={(e) => props.onEndChange(e.target.value)}
            className="w-full rounded-md border border-white/[0.12] bg-surface-input px-3 py-3 text-[13.5px] font-semibold text-ink outline-none focus:border-brand-light/60"
          />
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full rounded-[13px]"
        onClick={props.onSubmit}
      >
        Calculer ma simulation
      </Button>
    </div>
  );
}

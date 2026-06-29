"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { ResultsPanel } from "./ResultsPanel";
import { cn } from "@/lib/utils";
import { COIN_IDS } from "@/lib/coins";
import { getPriceHistory } from "@/lib/prices/getPriceHistory";
import { getCoinDateRange } from "@/lib/prices/generateMockPrices";
import { runSimulation } from "@/lib/simulation";
import type { CoinId, DcaFrequency, InvestmentMode } from "@/lib/types";

export interface CryptoSimulatorProps {
  /** Crypto sélectionnée au départ. */
  defaultCoin?: CoinId;
  /** Montant initial (total en one-shot, par apport en DCA). */
  defaultAmount?: number;
  defaultMode?: InvestmentMode;
  defaultFrequency?: DcaFrequency;
  /** Date de début ISO `YYYY-MM-DD`. */
  defaultStartDate?: string;
  /** Date de fin ISO `YYYY-MM-DD`. */
  defaultEndDate?: string;
  /** Sous-ensemble de cryptos proposées (par défaut : toutes). */
  coins?: CoinId[];
  className?: string;
}

function clampDate(value: string, min: string, max: string): string {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Simulateur d'investissement crypto — composant autonome et réutilisable.
 *
 * Toute la logique de prix passe par `getPriceHistory()` (mock aujourd'hui),
 * et tout le calcul par `runSimulation()` (lib pure). Le composant ne fait que
 * gérer l'état du formulaire, recalculer en direct, et présenter le résultat.
 */
export function CryptoSimulator({
  defaultCoin = "BTC",
  defaultAmount = 200,
  defaultMode = "dca",
  defaultFrequency = "monthly",
  defaultStartDate = "2021-01-01",
  defaultEndDate = "2025-06-01",
  coins = COIN_IDS,
  className,
}: CryptoSimulatorProps) {
  const [coin, setCoin] = useState<CoinId>(defaultCoin);
  const [amount, setAmount] = useState(String(defaultAmount));
  const [mode, setMode] = useState<InvestmentMode>(defaultMode);
  const [frequency, setFrequency] = useState<DcaFrequency>(defaultFrequency);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Bornes disponibles pour la crypto courante (selon les données mock).
  const range = useMemo(() => getCoinDateRange(coin), [coin]);

  // Garde les dates dans les bornes de la crypto (ex. SOL démarre plus tard).
  useEffect(() => {
    setStartDate((d) => clampDate(d, range.min, range.max));
    setEndDate((d) => clampDate(d, range.min, range.max));
  }, [range.min, range.max]);

  const effectiveStart = clampDate(startDate, range.min, range.max);
  const effectiveEnd = clampDate(endDate, range.min, range.max);
  const orderedStart = effectiveStart <= effectiveEnd ? effectiveStart : effectiveEnd;
  const orderedEnd = effectiveStart <= effectiveEnd ? effectiveEnd : effectiveStart;

  // Source de données isolée → lib de calcul pure. Recalcul en direct.
  const result = useMemo(() => {
    const prices = getPriceHistory(coin, orderedStart, orderedEnd);
    return runSimulation({
      prices,
      amount: Number(amount) || 0,
      mode,
      frequency,
    });
  }, [coin, orderedStart, orderedEnd, amount, mode, frequency]);

  // « Calculer » : le résultat est déjà live ; on amène l'utilisateur dessus
  // (utile sur mobile où le panneau résultats est plus haut dans la page).
  const handleSubmit = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="order-2 lg:order-1">
          <SettingsPanel
            coins={coins}
            coin={coin}
            amount={amount}
            mode={mode}
            frequency={frequency}
            startDate={orderedStart}
            endDate={orderedEnd}
            minDate={range.min}
            maxDate={range.max}
            onCoinChange={setCoin}
            onAmountChange={setAmount}
            onModeChange={setMode}
            onFrequencyChange={setFrequency}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onSubmit={handleSubmit}
          />
        </div>
        <div ref={resultsRef} className="order-1 scroll-mt-6 lg:order-2">
          <ResultsPanel
            result={result}
            mode={mode}
            frequency={frequency}
            amount={amount}
            startDate={orderedStart}
            endDate={orderedEnd}
          />
        </div>
      </div>
    </div>
  );
}

import type {
  DcaFrequency,
  PricePoint,
  SimulationParams,
  SimulationPoint,
  SimulationResult,
} from "./types";

/**
 * Lib de calcul PURE et testable.
 *
 * Entrée : un simple tableau `{ date, price }[]` (cf. `PricePoint`) + des
 * paramètres d'investissement. Aucune dépendance à l'UI, au réseau ou à la
 * source des prix. C'est un backtest rétrospectif : on rejoue l'historique,
 * aucune prédiction.
 *
 * - one-shot : achat unique au premier prix de la période.
 * - DCA      : un apport `amount` à chaque échéance (quotidienne / hebdo /
 *              mensuelle), chaque apport achète au prix de SA date.
 */

const EMPTY_RESULT: SimulationResult = {
  series: [],
  totalInvested: 0,
  finalValue: 0,
  pnl: 0,
  pnlPct: 0,
  units: 0,
  contributions: 0,
};

const MS_PER_DAY = 86_400_000;

function parseISO(date: string): number {
  // `YYYY-MM-DD` interprété en UTC pour éviter les surprises de fuseau.
  return Date.parse(`${date}T00:00:00Z`);
}

function daysBetween(aISO: string, bISO: string): number {
  return Math.round((parseISO(bISO) - parseISO(aISO)) / MS_PER_DAY);
}

function monthIndex(date: string): number {
  const [y, m] = date.split("-").map(Number);
  return y * 12 + (m - 1);
}

/**
 * Décide si l'on effectue un apport DCA à la date courante, étant donnée la
 * date du dernier apport. Le premier point de la période donne toujours lieu
 * à un apport.
 */
function isContributionDay(
  current: string,
  last: string | null,
  frequency: DcaFrequency,
): boolean {
  if (last === null) return true;
  switch (frequency) {
    case "daily":
      return true;
    case "weekly":
      return daysBetween(last, current) >= 7;
    case "monthly":
      return monthIndex(current) - monthIndex(last) >= 1;
  }
}

export function runSimulation(params: SimulationParams): SimulationResult {
  const { prices, mode } = params;
  const amount = Number(params.amount);

  if (prices.length === 0) return EMPTY_RESULT;

  // Montant invalide ou nul : trajectoire à zéro plutôt qu'un crash.
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ...EMPTY_RESULT,
      series: prices.map((p) => ({
        date: p.date,
        invested: 0,
        value: 0,
        price: p.price,
      })),
    };
  }

  if (mode === "oneshot") {
    return simulateOneShot(prices, amount);
  }
  return simulateDca(prices, amount, params.frequency ?? "monthly");
}

function simulateOneShot(prices: PricePoint[], amount: number): SimulationResult {
  const buyPrice = prices[0].price;
  const units = buyPrice > 0 ? amount / buyPrice : 0;

  const series: SimulationPoint[] = prices.map((p) => ({
    date: p.date,
    invested: amount,
    value: units * p.price,
    price: p.price,
  }));

  return finalize(series, units, 1);
}

function simulateDca(
  prices: PricePoint[],
  amountPerContribution: number,
  frequency: DcaFrequency,
): SimulationResult {
  let units = 0;
  let invested = 0;
  let contributions = 0;
  let lastContribution: string | null = null;

  const series: SimulationPoint[] = prices.map((p) => {
    if (p.price > 0 && isContributionDay(p.date, lastContribution, frequency)) {
      units += amountPerContribution / p.price;
      invested += amountPerContribution;
      contributions += 1;
      lastContribution = p.date;
    }
    return {
      date: p.date,
      invested,
      value: units * p.price,
      price: p.price,
    };
  });

  return finalize(series, units, contributions);
}

function finalize(
  series: SimulationPoint[],
  units: number,
  contributions: number,
): SimulationResult {
  const last = series[series.length - 1];
  const totalInvested = last.invested;
  const finalValue = last.value;
  const pnl = finalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return { series, totalInvested, finalValue, pnl, pnlPct, units, contributions };
}

/**
 * Types partagés du simulateur.
 * Nommage : EN pour le code, FR pour l'UI (constant dans tout le projet).
 */

export type CoinId = "BTC" | "ETH" | "SOL" | "BNB" | "XRP";

export type InvestmentMode = "oneshot" | "dca";

export type DcaFrequency = "daily" | "weekly" | "monthly";

/**
 * Point de prix générique — c'est le SEUL contrat entre la source de données
 * et la lib de calcul. Brancher une vraie API plus tard ne change que la
 * fonction `getPriceHistory`, jamais la lib de calcul ni l'UI.
 */
export interface PricePoint {
  /** Date ISO `YYYY-MM-DD`. */
  date: string;
  /** Prix de clôture en euros. */
  price: number;
}

export interface SimulationParams {
  /** Historique de prix trié par date croissante, déjà borné à [from, to]. */
  prices: PricePoint[];
  /** Montant en € : total pour one-shot, par apport pour le DCA. */
  amount: number;
  mode: InvestmentMode;
  /** Requis uniquement en mode DCA. */
  frequency?: DcaFrequency;
}

/** Un point de la trajectoire du portefeuille (granularité journalière). */
export interface SimulationPoint {
  date: string;
  /** Cumul investi à cette date. */
  invested: number;
  /** Valeur de marché du portefeuille à cette date. */
  value: number;
  /** Prix unitaire de la crypto à cette date. */
  price: number;
}

export interface SimulationResult {
  series: SimulationPoint[];
  /** Total réellement investi (somme des apports). */
  totalInvested: number;
  /** Valeur finale du portefeuille. */
  finalValue: number;
  /** Plus/moins-value en €. */
  pnl: number;
  /** Plus/moins-value en %. */
  pnlPct: number;
  /** Quantité de crypto détenue à la fin. */
  units: number;
  /** Nombre d'apports effectués (1 en one-shot). */
  contributions: number;
}

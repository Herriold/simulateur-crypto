import type { CoinId, PricePoint } from "../types";

/**
 * DONNÉES MOCK — choix assumé pour fiabiliser la démo (aucun appel réseau,
 * aucune clé API, fonctionne hors-ligne et ne peut pas échouer).
 *
 * Les trajectoires ne sont PAS du random pur : pour chaque crypto on fixe des
 * points d'ancrage (date → prix, d'ordre de grandeur réaliste), on interpole
 * en log-linéaire entre ces ancres, puis on ajoute une volatilité réaliste via
 * un bruit déterministe seedé (PRNG + marche aléatoire à retour à la moyenne).
 * Résultat : des courbes journalières plausibles sur ~5-6 ans, identiques à
 * chaque rendu (déterministe).
 *
 * En prod, on remplacerait ce module par un vrai fournisseur derrière
 * `getPriceHistory()` — le reste du code (lib de calcul, UI) ne bouge pas.
 */

interface Anchor {
  date: string;
  price: number;
}

/** Points d'ancrage par crypto (prix EUR approximatifs, jalons marquants). */
const ANCHORS: Record<CoinId, Anchor[]> = {
  BTC: [
    { date: "2020-01-01", price: 6500 },
    { date: "2020-07-01", price: 8200 },
    { date: "2020-12-01", price: 17000 },
    { date: "2021-04-15", price: 55000 },
    { date: "2021-07-20", price: 26000 },
    { date: "2021-11-08", price: 60000 },
    { date: "2022-01-01", price: 40000 },
    { date: "2022-06-18", price: 18000 },
    { date: "2022-11-09", price: 16000 },
    { date: "2023-06-01", price: 26000 },
    { date: "2023-10-01", price: 26000 },
    { date: "2024-03-13", price: 65000 },
    { date: "2024-08-05", price: 49000 },
    { date: "2024-12-17", price: 100000 },
    { date: "2025-06-01", price: 92000 },
    { date: "2026-06-01", price: 105000 },
  ],
  ETH: [
    { date: "2020-01-01", price: 120 },
    { date: "2020-12-01", price: 500 },
    { date: "2021-05-12", price: 3800 },
    { date: "2021-07-20", price: 1700 },
    { date: "2021-11-10", price: 4000 },
    { date: "2022-06-18", price: 900 },
    { date: "2022-11-09", price: 1100 },
    { date: "2023-06-01", price: 1700 },
    { date: "2024-03-13", price: 3600 },
    { date: "2024-09-01", price: 2200 },
    { date: "2025-01-01", price: 3000 },
    { date: "2025-06-01", price: 2400 },
    { date: "2026-06-01", price: 3200 },
  ],
  SOL: [
    { date: "2020-05-01", price: 0.6 },
    { date: "2020-12-01", price: 1.5 },
    { date: "2021-09-01", price: 170 },
    { date: "2021-11-06", price: 230 },
    { date: "2022-06-18", price: 32 },
    { date: "2022-12-29", price: 9 },
    { date: "2023-06-01", price: 18 },
    { date: "2023-11-01", price: 40 },
    { date: "2024-03-18", price: 190 },
    { date: "2025-01-19", price: 250 },
    { date: "2025-06-01", price: 150 },
    { date: "2026-06-01", price: 185 },
  ],
  BNB: [
    { date: "2020-01-01", price: 12 },
    { date: "2020-12-01", price: 28 },
    { date: "2021-05-10", price: 600 },
    { date: "2021-07-20", price: 270 },
    { date: "2021-11-01", price: 600 },
    { date: "2022-06-18", price: 200 },
    { date: "2023-06-01", price: 240 },
    { date: "2024-03-15", price: 550 },
    { date: "2024-12-01", price: 650 },
    { date: "2025-06-01", price: 600 },
    { date: "2026-06-01", price: 680 },
  ],
  XRP: [
    { date: "2020-01-01", price: 0.18 },
    { date: "2021-04-14", price: 1.6 },
    { date: "2021-07-20", price: 0.55 },
    { date: "2022-06-18", price: 0.32 },
    { date: "2023-06-01", price: 0.48 },
    { date: "2024-01-01", price: 0.55 },
    { date: "2024-12-01", price: 2.2 },
    { date: "2025-01-16", price: 3.0 },
    { date: "2025-06-01", price: 2.0 },
    { date: "2026-06-01", price: 2.4 },
  ],
};

/** Volatilité journalière (sigma) du bruit, par crypto — plus haute = plus nerveux. */
const VOLATILITY: Record<CoinId, number> = {
  BTC: 0.022,
  ETH: 0.028,
  SOL: 0.038,
  BNB: 0.026,
  XRP: 0.032,
};

/** Seed numérique stable dérivée du ticker (déterminisme). */
function seedFromCoin(coin: CoinId): number {
  let h = 2166136261;
  for (let i = 0; i < coin.length; i++) {
    h ^= coin.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG déterministe (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tirage gaussien N(0,1) approché (somme d'uniformes, théorème central limite). */
function gaussian(rand: () => number): number {
  return rand() + rand() + rand() + rand() - 2; // moyenne 0, écart-type ~0.577
}

function toUTC(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function isoFromUTC(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Prix « théorique » interpolé en log-linéaire entre deux ancres. */
function interpolate(anchors: Anchor[], dayMs: number): number {
  if (dayMs <= toUTC(anchors[0].date)) return anchors[0].price;
  const lastAnchor = anchors[anchors.length - 1];
  if (dayMs >= toUTC(lastAnchor.date)) return lastAnchor.price;

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const aMs = toUTC(a.date);
    const bMs = toUTC(b.date);
    if (dayMs >= aMs && dayMs <= bMs) {
      const t = (dayMs - aMs) / (bMs - aMs);
      // Interpolation géométrique : un mouvement crypto se lit en %.
      return a.price * Math.pow(b.price / a.price, t);
    }
  }
  return lastAnchor.price;
}

const MS_PER_DAY = 86_400_000;

/** Génère la série journalière complète d'une crypto (mémoïsée). */
function generate(coin: CoinId): PricePoint[] {
  const anchors = ANCHORS[coin];
  const startMs = toUTC(anchors[0].date);
  const endMs = toUTC(anchors[anchors.length - 1].date);
  const rand = mulberry32(seedFromCoin(coin));
  const sigma = VOLATILITY[coin];

  const series: PricePoint[] = [];
  let noise = 0; // marche aléatoire à retour à la moyenne (log-espace)

  for (let ms = startMs; ms <= endMs; ms += MS_PER_DAY) {
    noise = noise * 0.94 + gaussian(rand) * sigma;
    const base = interpolate(anchors, ms);
    const price = base * Math.exp(noise);
    series.push({
      date: isoFromUTC(ms),
      price: roundPrice(price),
    });
  }
  return series;
}

/** Arrondi adapté à l'ordre de grandeur (centimes pour XRP, euros pour BTC). */
function roundPrice(price: number): number {
  if (price >= 1000) return Math.round(price);
  if (price >= 10) return Math.round(price * 100) / 100;
  return Math.round(price * 10000) / 10000;
}

const cache = new Map<CoinId, PricePoint[]>();

/** Série journalière complète et déterministe pour une crypto. */
export function getMockPriceSeries(coin: CoinId): PricePoint[] {
  let series = cache.get(coin);
  if (!series) {
    series = generate(coin);
    cache.set(coin, series);
  }
  return series;
}

/** Bornes de dates disponibles pour une crypto (utile pour les date pickers). */
export function getCoinDateRange(coin: CoinId): { min: string; max: string } {
  const series = getMockPriceSeries(coin);
  return { min: series[0].date, max: series[series.length - 1].date };
}

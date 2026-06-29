import type { CoinId, PricePoint } from "../types";
import { getMockPriceSeries } from "./generateMockPrices";

/**
 * ★ SEUL POINT DE CONTACT AVEC LA SOURCE DE DONNÉES ★
 *
 * Toute la donnée de prix passe par ici. Aujourd'hui : mock déterministe
 * bundlé dans le repo. Demain : un vrai fournisseur (CoinGecko, cache
 * Supabase via une route API Next.js…). Brancher la vraie API ne doit toucher
 * QUE cette fonction — la lib de calcul et l'UI consomment un simple
 * `PricePoint[]` et ne changent pas.
 *
 * Exemple de bascule prod :
 *   export async function getPriceHistory(coin, from, to) {
 *     const res = await fetch(`/api/prices?coin=${coin}&from=${from}&to=${to}`);
 *     return res.json();
 *   }
 *
 * @param coin Identifiant de la crypto.
 * @param from Date ISO `YYYY-MM-DD` incluse (optionnelle).
 * @param to   Date ISO `YYYY-MM-DD` incluse (optionnelle).
 */
export function getPriceHistory(
  coin: CoinId,
  from?: string,
  to?: string,
): PricePoint[] {
  const all = getMockPriceSeries(coin);
  if (all.length === 0) return [];

  const lo = from ?? all[0].date;
  const hi = to ?? all[all.length - 1].date;

  // Comparaison lexicographique : valide pour des dates ISO `YYYY-MM-DD`.
  return all.filter((p) => p.date >= lo && p.date <= hi);
}

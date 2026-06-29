import { describe, it, expect } from "vitest";
import { runSimulation } from "./simulation";
import type { PricePoint } from "./types";

/** Petit historique synthétique, facile à vérifier à la main. */
const prices: PricePoint[] = [
  { date: "2021-01-01", price: 100 },
  { date: "2021-02-01", price: 200 },
  { date: "2021-03-01", price: 50 },
  { date: "2021-04-01", price: 400 },
];

describe("runSimulation — one-shot", () => {
  it("achète une fois au premier prix et suit la valeur", () => {
    const r = runSimulation({ prices, amount: 1000, mode: "oneshot" });

    // 1000 € au prix 100 => 10 unités.
    expect(r.units).toBeCloseTo(10, 10);
    expect(r.contributions).toBe(1);
    expect(r.totalInvested).toBe(1000);
    // Valeur finale = 10 unités * 400 = 4000.
    expect(r.finalValue).toBeCloseTo(4000, 6);
    expect(r.pnl).toBeCloseTo(3000, 6);
    expect(r.pnlPct).toBeCloseTo(300, 6);
  });

  it("expose une série de la même longueur que l'historique", () => {
    const r = runSimulation({ prices, amount: 500, mode: "oneshot" });
    expect(r.series).toHaveLength(prices.length);
    expect(r.series[0].invested).toBe(500);
    expect(r.series[2].value).toBeCloseTo((500 / 100) * 50, 6); // creux à 50
  });
});

describe("runSimulation — DCA", () => {
  it("somme chaque apport au prix de sa date (mensuel)", () => {
    const r = runSimulation({
      prices,
      amount: 100,
      mode: "dca",
      frequency: "monthly",
    });

    // 4 apports de 100 € (un par mois distinct).
    expect(r.contributions).toBe(4);
    expect(r.totalInvested).toBe(400);

    // Unités = 100/100 + 100/200 + 100/50 + 100/400
    //        = 1 + 0.5 + 2 + 0.25 = 3.75
    expect(r.units).toBeCloseTo(3.75, 10);

    // Valeur finale = 3.75 * 400 = 1500.
    expect(r.finalValue).toBeCloseTo(1500, 6);
    expect(r.pnl).toBeCloseTo(1100, 6);
    expect(r.pnlPct).toBeCloseTo(275, 6);
  });

  it("le cumul investi croît par paliers le long de la série", () => {
    const r = runSimulation({
      prices,
      amount: 100,
      mode: "dca",
      frequency: "monthly",
    });
    expect(r.series.map((p) => p.invested)).toEqual([100, 200, 300, 400]);
  });

  it("respecte la fréquence hebdomadaire (>= 7 jours entre apports)", () => {
    const weekly: PricePoint[] = Array.from({ length: 21 }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return { date: `2021-01-${day}`, price: 10 };
    });
    const r = runSimulation({
      prices: weekly,
      amount: 10,
      mode: "dca",
      frequency: "weekly",
    });
    // Jours 1, 8, 15 => 3 apports sur 21 jours.
    expect(r.contributions).toBe(3);
    expect(r.totalInvested).toBe(30);
  });

  it("fréquence quotidienne : un apport par point", () => {
    const r = runSimulation({
      prices,
      amount: 10,
      mode: "dca",
      frequency: "daily",
    });
    expect(r.contributions).toBe(prices.length);
  });
});

describe("runSimulation — cas limites", () => {
  it("retourne un résultat vide sans historique", () => {
    const r = runSimulation({ prices: [], amount: 1000, mode: "oneshot" });
    expect(r.series).toHaveLength(0);
    expect(r.finalValue).toBe(0);
    expect(r.totalInvested).toBe(0);
  });

  it("montant nul ou invalide => trajectoire à zéro, pas de crash", () => {
    const r = runSimulation({ prices, amount: 0, mode: "dca", frequency: "monthly" });
    expect(r.totalInvested).toBe(0);
    expect(r.finalValue).toBe(0);
    expect(r.series).toHaveLength(prices.length);
  });

  it("plus-value négative quand le prix final est sous l'entrée (one-shot)", () => {
    const down: PricePoint[] = [
      { date: "2021-01-01", price: 100 },
      { date: "2021-02-01", price: 40 },
    ];
    const r = runSimulation({ prices: down, amount: 100, mode: "oneshot" });
    expect(r.pnl).toBeCloseTo(-60, 6);
    expect(r.pnlPct).toBeCloseTo(-60, 6);
  });
});

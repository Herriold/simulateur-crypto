/** Formatage FR pour l'affichage (€, %, dates). */

const eurFormatters = new Map<number, Intl.NumberFormat>();

function eurFormatter(digits: number): Intl.NumberFormat {
  let f = eurFormatters.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    eurFormatters.set(digits, f);
  }
  return f;
}

/** Ex. `12 480 €`. */
export function formatEUR(value: number, digits = 0): string {
  return eurFormatter(digits).format(value);
}

/** Plus-value signée, ex. `+12 480 €` / `−3 200 €` (vrai signe moins). */
export function formatSignedEUR(value: number, digits = 0): string {
  const sign = value >= 0 ? "+" : "−";
  return sign + formatEUR(Math.abs(value), digits);
}

/** Pourcentage signé, ex. `+248,0 %`. */
export function formatSignedPct(value: number): string {
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${Math.abs(value).toFixed(1).replace(".", ",")} %`;
}

/** Format compact pour les axes du graphe, ex. `95 k€`, `2,2 €`. */
export function formatCompactEUR(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${Math.round(value / 1000)} k€`;
  }
  if (Math.abs(value) >= 10) return `${Math.round(value)} €`;
  return `${value.toFixed(2).replace(".", ",")} €`;
}

const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** `2024-03-13` → `mars 24`. */
export function formatMonthShort(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS_FR[m - 1]} ${String(y).slice(2)}`;
}

/** `2024-03-13` → `13 mars 2024`. */
export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_FR[m - 1]} ${y}`;
}

/** `2024-03-13` → `mars 2024` (pour le bandeau d'en-tête). */
export function formatMonthLong(iso: string): string {
  const monthsLong = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  const [y, m] = iso.split("-").map(Number);
  return `${monthsLong[m - 1]} ${y}`;
}

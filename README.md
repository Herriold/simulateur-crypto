# Simulateur d'investissement crypto

Transposition du **simulateur crypto de S'investir** à la charte de
[simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/) — thème sombre,
premium, pédagogique.

Backtest rétrospectif **one-shot** ou **DCA** (Dollar-Cost Averaging) sur BTC,
ETH, SOL, BNB et XRP. **Next.js (App Router) + TypeScript + Tailwind + shadcn +
Recharts**, déployable sur Vercel.

> ⚠️ Les données de prix sont des **données mock** (voir plus bas). Aucune
> prédiction, aucun conseil en investissement.

---

## Lancer le projet

```bash
npm install
npm run dev      # http://localhost:3000
```

Autres scripts :

```bash
npm run build    # build de production
npm run start    # sert le build
npm run test     # tests unitaires de la lib de calcul (Vitest)
```

Aucune variable d'environnement, aucune clé API : **ça marche hors-ligne et à
tous les coups.**

---

## Le composant `<CryptoSimulator />`

Le simulateur est un **composant autonome et réutilisable**, pensé pour être
embarqué ailleurs (page de la suite, iframe/embed depuis sinvestir.fr).

```tsx
import { CryptoSimulator } from "@/components/simulator";

<CryptoSimulator
  defaultCoin="BTC"          // "BTC" | "ETH" | "SOL" | "BNB" | "XRP"
  defaultAmount={200}        // € (total en one-shot, par apport en DCA)
  defaultMode="dca"          // "oneshot" | "dca"
  defaultFrequency="monthly" // "daily" | "weekly" | "monthly"
  defaultStartDate="2021-01-01"
  defaultEndDate="2025-06-01"
  coins={["BTC", "ETH", "SOL", "BNB", "XRP"]} // sous-ensemble optionnel
/>
```

Toutes les props ont des valeurs par défaut : `<CryptoSimulator />` seul suffit.
Le composant embarque ses propres réglages, résultats, graphique et disclaimer ;
la page hôte ne fournit que l'habillage (nav, titre).

---

## Architecture

```
app/
  layout.tsx              # font Plus Jakarta Sans, métadonnées
  page.tsx                # page de démo (chrome S'investir) + <CryptoSimulator/>
  globals.css             # Tailwind + utilitaires de charte

components/
  ui/                     # primitives shadcn (button, card)
  simulator/
    CryptoSimulator.tsx   # composant public (état + orchestration)
    SettingsPanel.tsx     # formulaire (crypto, montant, mode, fréquence, dates)
    ResultsPanel.tsx      # hero plus-value, cartes stats, graphe
    PortfolioChart.tsx    # graphe Recharts (valeur + cumul investi)

lib/
  types.ts                # types partagés
  simulation.ts           # ★ lib de calcul PURE et testable
  simulation.test.ts      # tests unitaires (one-shot + DCA)
  coins.ts                # métadonnées des cryptos (nom, couleur, symbole)
  format.ts               # formatage FR (€, %, dates)
  prices/
    getPriceHistory.ts    # ★ SEULE porte d'entrée des données
    generateMockPrices.ts # générateur mock déterministe
```

### Les deux points d'architecture clés

1. **La lib de calcul est pure.** `runSimulation()` prend un simple
   `{ date, price }[]` + des paramètres, et ne connaît ni le réseau, ni l'UI,
   ni la provenance des prix. Elle est testée en isolation
   (`lib/simulation.test.ts`).

2. **La source des données est isolée derrière une seule fonction.**
   Toute la donnée passe par `getPriceHistory(coin, from, to): PricePoint[]`.
   Brancher une vraie API plus tard ne touche **que cette fonction** — la lib de
   calcul et l'UI ne bougent pas.

---

## Logique de calcul

Backtest rétrospectif, **aucune prédiction** :

- **One-shot** : achat unique au premier prix de la période.
  `unités = montant / prix₀`, puis `valeur(t) = unités × prix(t)`.
- **DCA** : un apport `montant` à chaque échéance (quotidienne / hebdo /
  mensuelle). **Chaque apport achète au prix de sa date** ; on somme les unités
  et le cumul investi le long de la trajectoire.

Sorties : montant total investi, valeur finale du portefeuille, plus/moins-value
en € et en %, et une série journalière pour le graphique (valeur vs cumul
investi).

---

## Choix assumé des données mock

**Données mock pour fiabiliser la démo** : la démo ne doit jamais échouer ni
dépendre du réseau, donc tous les prix sont **figés et générés par une fonction
déterministe seedée**, bundlée dans le repo.

Les courbes ne sont **pas du random pur** : pour chaque crypto on fixe des
points d'ancrage (date → prix d'ordre de grandeur réaliste, reprenant les grands
jalons de marché), on interpole en log-linéaire entre ces ancres, puis on ajoute
une volatilité réaliste via un bruit déterministe (PRNG mulberry32 + marche
aléatoire à retour à la moyenne). Résultat : des trajectoires **plausibles et
reproductibles** sur ~5-6 ans de points quotidiens.

**En production**, on remplacerait le mock par un vrai fournisseur **en ne
modifiant que `getPriceHistory()`** — par exemple :

- appel **CoinGecko** (`/coins/{id}/market_chart/range`), ou
- un **cache Supabase** alimenté par un cron, lu via une **route API Next.js**
  (`app/api/prices/route.ts`) pour masquer la clé et limiter le rate-limit.

```ts
// getPriceHistory.ts — version prod (esquisse)
export async function getPriceHistory(coin, from, to): Promise<PricePoint[]> {
  const res = await fetch(`/api/prices?coin=${coin}&from=${from}&to=${to}`);
  return res.json(); // même contrat { date, price }[] — rien d'autre ne change
}
```

---

## Déploiement Vercel

Le projet est une app Next.js standard, prête à déployer :

1. Pousser le repo sur GitHub.
2. Sur [vercel.com](https://vercel.com) → **New Project** → importer le repo.
3. Framework détecté automatiquement (Next.js), **aucune config requise**.
4. Deploy.

Ou en CLI : `npx vercel`.

---

## Partis pris

- **Calcul en direct** : le résultat se met à jour à chaque changement de
  paramètre (le bouton « Calculer » fait défiler vers les résultats, surtout
  utile sur mobile).
- **`<input type="date">` natif** plutôt qu'un date-picker lourd : fiable,
  accessible, sans dépendance, bornes calées sur les données disponibles.
- **Nommage** : EN dans le code, FR dans l'UI, de façon constante.
- **Disclaimers de risque** présents (volatilité, perte en capital).

## Pistes d'amélioration

- Brancher une vraie source de prix (CoinGecko / cache Supabase) via
  `getPriceHistory()`.
- Comparer plusieurs cryptos sur le même graphe.
- Frais d'achat / spread, fiscalité (PFU), apport initial + DCA combinés.
- Partage d'une simulation par URL (query params), export PNG/CSV.
- Tests d'intégration de l'UI (Testing Library / Playwright).
```

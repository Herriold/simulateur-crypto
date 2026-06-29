import type { CoinId } from "./types";

export interface CoinMeta {
  id: CoinId;
  name: string;
  ticker: string;
  /** Glyphe affiché dans la pastille ronde. */
  symbol: string;
  /** Couleur de marque (fond de pastille). */
  color: string;
}

export const COINS: Record<CoinId, CoinMeta> = {
  BTC: { id: "BTC", name: "Bitcoin", ticker: "BTC", symbol: "₿", color: "#F7931A" },
  ETH: { id: "ETH", name: "Ethereum", ticker: "ETH", symbol: "Ξ", color: "#627EEA" },
  SOL: { id: "SOL", name: "Solana", ticker: "SOL", symbol: "◎", color: "#14F195" },
  BNB: { id: "BNB", name: "BNB", ticker: "BNB", symbol: "⬢", color: "#F3BA2F" },
  XRP: { id: "XRP", name: "XRP", ticker: "XRP", symbol: "✕", color: "#27A2DB" },
};

export const COIN_IDS = Object.keys(COINS) as CoinId[];

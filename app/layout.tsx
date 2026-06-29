import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simulateur d'investissement crypto · S'investir",
  description:
    "Estimez ce qu'aurait rapporté un achat unique ou un investissement programmé (DCA) sur la crypto de votre choix. Backtest sur données historiques.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}

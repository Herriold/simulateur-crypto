import { Info } from "lucide-react";
import { CryptoSimulator } from "@/components/simulator";
import { SinvestirLogo } from "@/components/SinvestirLogo";

/** Ornement décoratif encadrant le titre (chevron bleu, charte S'investir). */
function TitleBracket({ side }: { side: "left" | "right" }) {
  const flip = side === "right";
  return (
    <svg
      width="66"
      height="16"
      viewBox="0 0 66 16"
      fill="none"
      className="hidden text-brand sm:block"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path
        d="M2 8h50l12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-app">
      {/* Barre de navigation (charte S'investir) */}
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-10 sm:py-5">
          <SinvestirLogo />
          <a
            href="https://www.sinvestir.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13.5px] font-semibold text-ink-cool transition-colors hover:text-ink"
          >
            Découvrir S&apos;investir
          </a>
        </div>
      </header>

      {/* En-tête de page — centré */}
      <div className="mx-auto max-w-[920px] px-5 pb-2 pt-10 text-center sm:pt-14">
        <div className="flex items-center justify-center gap-4">
          <TitleBracket side="left" />
          <h1 className="text-[22px] font-extrabold uppercase tracking-[0.04em] text-ink sm:text-[34px]">
            Simulateur d&apos;investissement crypto
          </h1>
          <TitleBracket side="right" />
        </div>
        <p className="mt-4 text-base font-semibold text-brand-sky sm:text-lg">
          Calculez ce qu&apos;un investissement crypto aurait pu vous rapporter au
          fil du temps
        </p>
        <p className="mx-auto mt-4 max-w-[680px] text-sm font-medium leading-relaxed text-ink-soft sm:text-[15px]">
          Achat unique ou investissement programmé (DCA), sur la crypto de votre
          choix : visualisez le montant investi, la valeur finale du portefeuille
          et la plus ou moins-value, à partir de données historiques de
          démonstration.
        </p>

        {/* Encart pédagogique */}
        <div className="mx-auto mt-7 flex max-w-[840px] items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-left sm:px-6">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-brand/40 bg-brand/[0.12]">
            <Info className="h-4 w-4 text-brand-sky" />
          </span>
          <p className="text-[13px] font-medium leading-relaxed text-ink-soft sm:text-sm">
            Cet outil a uniquement une vocation pédagogique et illustrative. Il
            rejoue un investissement passé à partir d&apos;hypothèses simplifiées
            et de données de démonstration, sans constituer un conseil en
            investissement ni une promesse de performance.
          </p>
        </div>
      </div>

      {/* Le composant autonome <CryptoSimulator /> */}
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-8 sm:px-10">
        <CryptoSimulator />
      </div>
    </main>
  );
}

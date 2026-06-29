import { cn } from "@/lib/utils";

/**
 * Marque S'investir · Simulateurs — approximation du logo live :
 * monogramme « S'investir » doré (sérif) + wordmark « SIMULATEURS ».
 */
export function SinvestirLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex flex-col items-center leading-none">
        <span
          className="text-[28px] font-bold italic text-brand-gold"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          S
        </span>
        <span className="-mt-0.5 text-[6px] font-semibold tracking-[0.28em] text-brand-gold">
          INVESTIR
        </span>
      </span>
      <span className="text-[15px] font-bold tracking-[0.18em] text-ink sm:text-[18px]">
        SIMULATEURS
      </span>
    </div>
  );
}

import Image from "next/image";
import { DEFAULT_PARCOURS, visualImage, type RemiseModule } from "@/lib/remise/content";

const CLOCKS = DEFAULT_PARCOURS.clocks;

function Clock({ label, hour, minute }: { label: string; hour: number; minute: number }) {
  const m = (minute / 60) * 360;
  const h = ((hour % 12) / 12) * 360 + minute / 2;
  return (
    <figure className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="h-24 w-24">
        <circle cx="50" cy="50" r="46" fill="var(--color-ink)" stroke="var(--color-teal)" strokeWidth="4" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="50" y1="9" x2="50" y2={i % 3 === 0 ? 17 : 13} stroke="var(--color-bg)" strokeWidth={i % 3 === 0 ? 3 : 1.5} transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <line x1="50" y1="50" x2="50" y2="28" stroke="var(--color-bg)" strokeWidth="5" strokeLinecap="round" transform={`rotate(${h} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="16" stroke="var(--color-coral)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${m} 50 50)`} />
        <circle cx="50" cy="50" r="4" fill="var(--color-bg)" />
      </svg>
      <figcaption className="text-sm font-bold text-[var(--color-ink)]">{label}</figcaption>
    </figure>
  );
}

/** Visuel du module : illustration du kit, ou dessin (nombres, calendrier, horloges). */
export default function ModuleVisual({ module: m }: { module: RemiseModule }) {
  const img = visualImage(m.visual);
  if (img) {
    return (
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-2xl">
        <Image src={img} alt="" fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
      </div>
    );
  }
  if (m.visual === "none") return null;
  if (m.visual === "clocks") {
    return (
      <div className="flex justify-around rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] py-5">
        {CLOCKS.clocks.map((c) => (
          <Clock key={c.label} {...c} />
        ))}
      </div>
    );
  }
  if (m.visual === "calendar") {
    const days = ["L", "M", "X", "J", "V", "S", "D"];
    const highlight: Record<number, string> = { 12: "var(--color-teal)", 14: "var(--color-sun)", 16: "var(--color-coral)", 17: "var(--color-blue)" };
    // Octobre 2026 commence un jeudi : 3 cases vides.
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-4">
        <p className="mb-2 text-center text-sm font-bold tracking-wide text-[var(--color-ink)]">OCTUBRE</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((d) => (
            <span key={d} className="py-1 font-semibold text-[var(--color-ink-faint)]">{d}</span>
          ))}
          {Array.from({ length: 3 }).map((_, i) => <span key={`e${i}`} />)}
          {Array.from({ length: 31 }).map((_, i) => {
            const day = i + 1;
            const c = highlight[day];
            return (
              <span key={day} className="rounded-lg py-1.5 text-[var(--color-ink-soft)]" style={c ? { background: c, color: "var(--color-bg)", fontWeight: 700 } : undefined}>
                {day}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  // numbers
  const tiles = [["1", "uno"], ["15", "quince"], ["23", "veintitrés"], ["58", "cincuenta y ocho"], ["100", "cien"]];
  return (
    <div className="flex flex-wrap justify-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-4">
      {tiles.map(([n, w], i) => (
        <div key={n} className="flex min-w-24 flex-col items-center rounded-xl px-3 py-2" style={{ background: `color-mix(in srgb, ${["var(--color-teal)", "var(--color-sun)", "var(--color-coral)", "var(--color-blue)", "var(--color-teal)"][i]} 14%, transparent)` }}>
          <span className="text-2xl font-bold text-[var(--color-ink)]">{n}</span>
          <span className="text-xs text-[var(--color-ink-soft)]">{w}</span>
        </div>
      ))}
    </div>
  );
}

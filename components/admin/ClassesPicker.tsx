"use client";

import { classes } from "@/lib/classes";

/** Regroupe les classes par niveau à partir du libellé ("3A" -> "3e"). */
function niveaux() {
  const map = new Map<string, string[]>();
  for (const c of classes) {
    const n = c.classeLabel.match(/^\d+/)?.[0];
    if (!n) continue;
    const key = `${n}e`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c.classeSlug);
  }
  return Array.from(map, ([label, slugs]) => ({ label, slugs }));
}

export default function ClassesPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const selected = new Set(value);
  const ordered = (set: Set<string>) => classes.map((c) => c.classeSlug).filter((s) => set.has(s));

  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange(ordered(next));
  };
  const toggleGroup = (slugs: string[]) => {
    const allIn = slugs.every((s) => selected.has(s));
    const next = new Set(selected);
    for (const s of slugs) {
      if (allIn) next.delete(s);
      else next.add(s);
    }
    onChange(ordered(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {classes.map((c) => (
          <button
            key={c.classeSlug}
            type="button"
            aria-pressed={selected.has(c.classeSlug)}
            onClick={() => toggle(c.classeSlug)}
            className={`chip ${selected.has(c.classeSlug) ? "chip-on" : ""}`}
          >
            {c.classeLabel}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {niveaux().map((n) => (
          <button key={n.label} type="button" onClick={() => toggleGroup(n.slugs)} className="text-[var(--color-ink-faint)] hover:text-[var(--color-teal)]">
            Toutes les {n.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => toggleGroup(classes.map((c) => c.classeSlug))}
          className="text-[var(--color-ink-faint)] hover:text-[var(--color-teal)]"
        >
          Toutes les classes
        </button>
      </div>
    </div>
  );
}

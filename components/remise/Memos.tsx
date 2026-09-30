"use client";

import { useState } from "react";
import { useParcours } from "./ParcoursContext";
import RichText from "./RichText";

const TABS = [
  { id: "lecons", label: "Leçons" },
  { id: "lexique", label: "Lexique" },
  { id: "verbes", label: "Verbes" },
  { id: "nombres", label: "Nombres" },
] as const;

export default function Memos() {
  const { modules: MODULES, memos: MEMOS } = useParcours();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("lecons");
  const [q, setQ] = useState("");
  const lexique = MODULES.flatMap((m) => Object.entries(m.glossary).map(([es, fr]) => ({ es, fr, id: m.id })));
  const filtered = lexique.filter((x) => !q || `${x.es} ${x.fr}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`chip !px-4 !py-1.5 !text-sm ${tab === t.id ? "chip-on" : ""}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lecons" && (
        <div className="grid gap-4 md:grid-cols-2">
          {MODULES.map((m) => (
            <div key={m.id} className="card rounded-2xl p-5">
              <p className="text-xs font-bold text-[var(--color-teal)]">{m.id}</p>
              <p className="text-lg font-bold text-[var(--color-ink)]">{m.copyLesson.title}</p>
              <div className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {m.copyLesson.lines.map((l, i) => (
                  <p key={i}>
                    <RichText text={l} />
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "lexique" && (
        <div className="flex flex-col gap-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un mot…" className="field max-w-sm" />
          <div className="card overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <tbody>
                {filtered.map((x, i) => (
                  <tr key={i} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-[var(--color-ink)]">{x.es}</td>
                    <td className="px-4 py-2.5 text-[var(--color-ink-soft)]">{x.fr}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-[var(--color-ink-faint)]">{x.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "verbes" && (
        <div className="card overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left">
                <th className="px-4 py-3 text-[var(--color-ink-faint)]" />
                {Object.keys(MEMOS.essentialVerbs).map((v) => (
                  <th key={v} className="px-4 py-3 font-bold text-[var(--color-teal)] uppercase">
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEMOS.order.map((pronoun, i) => (
                <tr key={pronoun} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-4 py-2.5 text-[var(--color-ink-faint)]">{pronoun}</td>
                  {Object.values(MEMOS.essentialVerbs).map((forms, j) => (
                    <td key={j} className="px-4 py-2.5 text-[var(--color-ink)]">
                      {forms[i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "nombres" && (
        <div className="flex flex-col gap-4">
          <div className="card rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-line text-[var(--color-ink)]">
            {MODULES.find((m) => m.id === "S03")?.copyLesson.lines.join("\n")}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MEMOS.hundreds.map((h) => {
              const [n, ...w] = h.split(" ");
              return (
                <div key={h} className="card rounded-xl px-3 py-2.5">
                  <span className="block text-lg font-bold text-[var(--color-ink)]">{n}</span>
                  <span className="text-sm text-[var(--color-ink-soft)]">{w.join(" ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

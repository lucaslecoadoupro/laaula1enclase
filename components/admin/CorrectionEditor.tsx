"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import type { CorrectionBloc } from "@/lib/corrections-repo";

type ClasseOption = { slug: string; label: string };
type SaveState = "idle" | "saving" | "saved" | "error";

async function patchBloc(id: string, fields: Partial<Pick<CorrectionBloc, "titre" | "contenu" | "classes">>) {
  const res = await fetch(`/api/admin/correction-blocs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("save failed");
}

function visibilityLabel(classes: string[], options: ClasseOption[]) {
  const visible = options.filter((o) => classes.includes(o.slug));
  if (visible.length === 0) return "Caché aux élèves";
  if (visible.length === options.length) return options.length > 1 ? "Visible par toutes les classes" : `Visible par la ${visible[0].label}`;
  return `Visible par ${visible.map((o) => o.label).join(", ")}`;
}

function BlocEditor({
  bloc,
  index,
  total,
  options,
  onMove,
  onDelete,
  onClassesChange,
}: {
  bloc: CorrectionBloc;
  index: number;
  total: number;
  options: ClasseOption[];
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onClassesChange: (classes: string[]) => void;
}) {
  const [titre, setTitre] = useState(bloc.titre);
  const [contenu, setContenu] = useState(bloc.contenu);
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ titre?: string; contenu?: string }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Enregistrement automatique 700 ms après la dernière frappe.
  function queueSave(fields: { titre?: string; contenu?: string }) {
    pending.current = { ...pending.current, ...fields };
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 700);
  }

  async function flush() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const fields = pending.current;
    if (!Object.keys(fields).length) return;
    pending.current = {};
    try {
      await patchBloc(bloc.id, fields);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  // Textarea qui grandit avec son contenu.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [contenu]);

  async function setClasses(classes: string[]) {
    onClassesChange(classes);
    setState("saving");
    try {
      await patchBloc(bloc.id, { classes });
      setState("saved");
    } catch {
      setState("error");
    }
  }

  const selected = new Set(bloc.classes);
  const hidden = options.every((o) => !selected.has(o.slug));
  const allShown = options.every((o) => selected.has(o.slug));

  return (
    <div
      className={`rounded-2xl border bg-[var(--color-bg-deep)] p-4 transition ${
        hidden ? "border-dashed border-[var(--color-line)]" : "border-[var(--color-teal)]/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <input
          value={titre}
          onChange={(e) => {
            setTitre(e.target.value);
            queueSave({ titre: e.target.value });
          }}
          onBlur={flush}
          placeholder={`Bloc ${index + 1} (ex. Exercice ${index + 1})`}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
        />
        <span className="flex h-6 w-6 items-center justify-center text-[var(--color-ink-faint)]" aria-live="polite">
          {state === "saving" && <Loader2 size={14} className="animate-spin" />}
          {state === "saved" && <Check size={14} className="text-[var(--color-teal)]" />}
          {state === "error" && <span className="text-xs text-[var(--color-coral)]">!</span>}
        </span>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Monter"
          className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30"
        >
          <ArrowUp size={15} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Descendre"
          className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-30"
        >
          <ArrowDown size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Supprimer le bloc"
          className="rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-coral)]"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={contenu}
        onChange={(e) => {
          setContenu(e.target.value);
          queueSave({ contenu: e.target.value });
        }}
        onBlur={flush}
        rows={3}
        placeholder="Réponses, explications…"
        className="field mt-2 resize-none leading-relaxed"
      />
      {state === "error" && <p className="mt-1 text-xs text-[var(--color-coral)]">Pas enregistré — vérifie ta connexion et retape un caractère.</p>}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {hidden ? <EyeOff size={14} className="text-[var(--color-ink-faint)]" /> : <Eye size={14} className="text-[var(--color-teal)]" />}
        <span className={`mr-1 text-xs ${hidden ? "text-[var(--color-ink-faint)]" : "text-[var(--color-teal)]"}`}>
          {visibilityLabel(bloc.classes, options)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.has(o.slug);
          return (
            <button
              key={o.slug}
              type="button"
              aria-pressed={on}
              onClick={() =>
                setClasses(on ? bloc.classes.filter((s) => s !== o.slug) : [...bloc.classes.filter((s) => s !== o.slug), o.slug])
              }
              className={`chip !px-2.5 !py-0.5 !text-xs ${on ? "chip-on" : ""}`}
            >
              {o.label}
            </button>
          );
        })}
        {options.length > 1 && (
          <button
            type="button"
            onClick={() => setClasses(allShown ? [] : options.map((o) => o.slug))}
            className="px-1 text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-teal)]"
          >
            {allShown ? "Tout cacher" : "Dévoiler à toutes"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CorrectionEditor({
  documentId,
  initial,
  options,
}: {
  documentId: string;
  initial: CorrectionBloc[];
  options: ClasseOption[];
}) {
  const [blocs, setBlocs] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    const res = await fetch(`/api/admin/corrections/${documentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre: `Exercice ${blocs.length + 1}` }),
    });
    setBusy(false);
    if (!res.ok) return;
    const { bloc } = await res.json();
    setBlocs((b) => [...b, bloc]);
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...blocs];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setBlocs(next);
    await fetch(`/api/admin/corrections/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((b) => b.id) }),
    });
  }

  async function remove(id: string) {
    const bloc = blocs.find((b) => b.id === id);
    if (bloc && (bloc.titre || bloc.contenu) && !confirm(`Supprimer le bloc "${bloc.titre || "sans titre"}" ?`)) return;
    setBlocs((b) => b.filter((x) => x.id !== id));
    await fetch(`/api/admin/correction-blocs/${id}`, { method: "DELETE" });
  }

  const shown = blocs.filter((b) => b.classes.some((c) => options.some((o) => o.slug === c))).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Corrigé</h2>
        <span className="text-xs text-[var(--color-ink-faint)]">
          {blocs.length === 0 ? "Aucun bloc" : `${shown} dévoilé${shown > 1 ? "s" : ""} sur ${blocs.length}`}
        </span>
      </div>
      <p className="text-sm text-[var(--color-ink-soft)]">
        Un bloc par exercice. Chaque bloc reste caché tant que tu ne coches pas de classe — dévoile-le au fil des cours.
        Tout s&apos;enregistre automatiquement.
      </p>

      {blocs.map((b, i) => (
        <BlocEditor
          key={b.id}
          bloc={b}
          index={i}
          total={blocs.length}
          options={options}
          onMove={(dir) => move(i, dir)}
          onDelete={() => remove(b.id)}
          onClassesChange={(classes) => setBlocs((all) => all.map((x) => (x.id === b.id ? { ...x, classes } : x)))}
        />
      ))}

      <button
        type="button"
        onClick={add}
        disabled={busy}
        className="btn btn-ghost border-dashed !py-3 text-[var(--color-ink-soft)]"
      >
        <Plus size={15} />
        Ajouter un bloc
      </button>
    </div>
  );
}

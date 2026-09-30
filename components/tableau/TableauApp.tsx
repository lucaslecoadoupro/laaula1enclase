"use client";

import { useEffect, useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowLeft,
  Clock,
  Dices,
  GripHorizontal,
  Hand,
  Image as ImageIcon,
  Maximize,
  Minimize,
  Minus,
  Plus,
  QrCode,
  Shuffle,
  Timer,
  TrafficCone,
  Type,
  Users,
  Volume2,
  X,
} from "lucide-react";
import {
  ClockWidget,
  DiceWidget,
  GroupsWidget,
  PickerWidget,
  QrWidget,
  SoundWidget,
  StopwatchWidget,
  TextWidget,
  TimerWidget,
  TrafficLightWidget,
  WorkModeWidget,
  type WidgetProps,
} from "./widgets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWidget = ComponentType<WidgetProps<any>>;

const CATALOG: { type: string; label: string; icon: ComponentType<{ size?: number }>; component: AnyWidget; initial: unknown }[] = [
  { type: "timer", label: "Minuteur", icon: AlarmClock, component: TimerWidget, initial: { duration: 300 } },
  { type: "stopwatch", label: "Chrono", icon: Timer, component: StopwatchWidget as AnyWidget, initial: {} },
  { type: "clock", label: "Horloge", icon: Clock, component: ClockWidget, initial: { lang: "es" } },
  { type: "picker", label: "Au hasard", icon: Shuffle, component: PickerWidget, initial: { withoutRepeat: true } },
  { type: "groups", label: "Groupes", icon: Users, component: GroupsWidget, initial: { size: 4 } },
  { type: "work", label: "Consigne", icon: Hand, component: WorkModeWidget, initial: { mode: "silencio" } },
  { type: "light", label: "Feu", icon: TrafficCone, component: TrafficLightWidget, initial: { on: "green" } },
  { type: "sound", label: "Sonomètre", icon: Volume2, component: SoundWidget, initial: { threshold: 55 } },
  { type: "text", label: "Texte", icon: Type, component: TextWidget, initial: { text: "", size: 40 } },
  { type: "dice", label: "Dés", icon: Dices, component: DiceWidget, initial: { count: 1 } },
  { type: "qr", label: "QR code", icon: QrCode, component: QrWidget, initial: { url: "" } },
];

const BACKGROUNDS = [
  { id: "nuit", label: "Bleu nuit", css: "radial-gradient(circle at 85% 0%, #1b3a78 0 22rem, transparent 22.1rem), #0b1633" },
  { id: "aurora", label: "Aurore", css: "linear-gradient(135deg, #0b1633 0%, #0f4c5c 55%, #2ad1b6 130%)" },
  { id: "sunset", label: "Couchant", css: "linear-gradient(135deg, #1a1036 0%, #7a2e4a 60%, #f6b733 140%)" },
  { id: "ardoise", label: "Ardoise", css: "#1d2b24" },
  { id: "couverture", label: "Collégiens", css: "linear-gradient(rgba(8,17,41,.55), rgba(8,17,41,.55)), url(/remise/couverture.webp) center/cover" },
  { id: "loisirs", label: "Loisirs", css: "linear-gradient(rgba(8,17,41,.6), rgba(8,17,41,.6)), url(/remise/loisirs.webp) center/cover" },
];

type Placed = { id: string; type: string; x: number; y: number; scale: number; z?: number; data: unknown };
type Layout = { bg: string; classe: string; widgets: Placed[] };

const KEY = "tableau-disposition-v1";
const uid = () => Math.random().toString(36).slice(2, 10);

function defaultLayout(classe: string): Layout {
  return {
    bg: "nuit",
    classe,
    widgets: [
      { id: uid(), type: "clock", x: 40, y: 90, scale: 1, data: { lang: "es" } },
      { id: uid(), type: "work", x: 460, y: 90, scale: 1, data: { mode: "silencio" } },
      { id: uid(), type: "timer", x: 880, y: 90, scale: 1, data: { duration: 300 } },
    ],
  };
}

export default function TableauApp({ classes }: { classes: { slug: string; label: string }[] }) {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [full, setFull] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  // Geste en cours : déplacement (par l'en-tête) ou redimensionnement (par le coin).
  const drag = useRef<
    | { mode: "move"; id: string; dx: number; dy: number }
    | { mode: "resize"; id: string; startX: number; startY: number; startScale: number; w0: number; h0: number; x: number; y: number }
    | null
  >(null);

  // Chargement de la disposition enregistrée sur cet ordinateur.
  useEffect(() => {
    let l: Layout | null = null;
    try {
      l = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    } catch {
      l = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayout(l && Array.isArray(l.widgets) ? { ...defaultLayout(classes[0]?.slug ?? ""), ...l } : defaultLayout(classes[0]?.slug ?? ""));
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [classes]);

  useEffect(() => {
    if (!layout) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(layout));
    } catch {
      // stockage indisponible
    }
  }, [layout]);

  if (!layout) return <div className="fixed inset-0 z-50 bg-[var(--color-bg)]" />;

  const classe = classes.find((c) => c.slug === layout.classe) ?? classes[0];
  const bg = BACKGROUNDS.find((b) => b.id === layout.bg) ?? BACKGROUNDS[0];
  const update = (fn: (l: Layout) => Layout) => setLayout((l) => (l ? fn(l) : l));
  const patchWidget = (id: string, patch: Partial<Placed>) => update((l) => ({ ...l, widgets: l.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
  // Premier plan via z-index (sans réordonner la liste : déplacer l'élément dans la page annulerait le clic en cours).
  const maxZ = Math.max(0, ...layout.widgets.map((w) => w.z ?? 0));
  const toFront = (id: string) => {
    const w = layout.widgets.find((x) => x.id === id);
    if (w && (w.z ?? 0) < maxZ) patchWidget(id, { z: maxZ + 1 });
    else if (w && maxZ === 0) patchWidget(id, { z: 1 });
  };

  function add(type: string) {
    const item = CATALOG.find((c) => c.type === type)!;
    // Nouveau widget au centre de l'écran, décalé en cascade s'il y en a déjà.
    const n = layout!.widgets.length % 6;
    const x = Math.max(16, Math.round(window.innerWidth / 2 - 180 + n * 36));
    const y = Math.max(80, Math.round(window.innerHeight / 2 - 200 + n * 30));
    update((l) => ({ ...l, widgets: [...l.widgets, { id: uid(), type, x, y, scale: 1, z: maxZ + 1, data: structuredClone(item.initial) }] }));
  }

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  /** Taille « naturelle » (non agrandie) du widget, mesurée dans la page. */
  function baseSize(el: Element | null) {
    const box = el?.closest("[data-widget]") as HTMLElement | null;
    return { w: box?.offsetWidth ?? 300, h: box?.offsetHeight ?? 200 };
  }

  /** Échelle maximale pour que le widget reste entièrement visible depuis sa position. */
  function maxScaleAt(x: number, y: number, w0: number, h0: number) {
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, (window.innerWidth - x - 8) / w0, (window.innerHeight - y - 8) / h0));
  }

  function setScale(w: Placed, target: number, el: Element | null) {
    const { w: w0, h: h0 } = baseSize(el);
    const scale = Math.max(MIN_SCALE, Math.min(target, maxScaleAt(w.x, w.y, w0, h0)));
    patchWidget(w.id, { scale: +scale.toFixed(3) });
  }

  function onMoveStart(e: ReactPointerEvent, w: Placed) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode: "move", id: w.id, dx: e.clientX - w.x, dy: e.clientY - w.y };
  }

  function onResizeStart(e: ReactPointerEvent, w: Placed) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { w: w0, h: h0 } = baseSize(e.currentTarget);
    drag.current = { mode: "resize", id: w.id, startX: e.clientX, startY: e.clientY, startScale: w.scale, w0, h0, x: w.x, y: w.y };
    toFront(w.id);
  }

  function onPointerMove(e: ReactPointerEvent) {
    const d = drag.current;
    if (!d) return;
    if (d.mode === "move") {
      const w = layout!.widgets.find((x) => x.id === d.id);
      const s = w?.scale ?? 1;
      const x = Math.max(-100, Math.min(window.innerWidth - 80, e.clientX - d.dx));
      const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - d.dy));
      patchWidget(d.id, { x, y, scale: s });
      return;
    }
    // Redimensionnement proportionnel : on suit la diagonale du coin tiré.
    const curW = d.w0 * d.startScale;
    const curH = d.h0 * d.startScale;
    const ratio = Math.max((curW + e.clientX - d.startX) / curW, (curH + e.clientY - d.startY) / curH);
    const scale = Math.max(MIN_SCALE, Math.min(d.startScale * ratio, maxScaleAt(d.x, d.y, d.w0, d.h0)));
    patchWidget(d.id, { scale: +scale.toFixed(3) });
  }

  async function toggleFull() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // plein écran refusé
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" style={{ background: bg.css }} onPointerMove={onPointerMove} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)}>
      {/* Barre du haut */}
      <div className="absolute inset-x-0 top-0 z-[10000] flex items-center gap-3 px-4 py-3">
        <Link href="/admin" className="btn btn-ghost !border-white/15 !bg-black/25 !py-2 !text-xs backdrop-blur" title="Retour à l'espace enseignant">
          <ArrowLeft size={14} /> Quitter
        </Link>
        <select
          value={classe?.slug}
          onChange={(e) => update((l) => ({ ...l, classe: e.target.value }))}
          className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white outline-none backdrop-blur"
          aria-label="Classe"
        >
          {classes.map((c) => (
            <option key={c.slug} value={c.slug} className="text-black">
              {c.label}
            </option>
          ))}
        </select>
        <div className="relative ml-auto">
          <button type="button" onClick={() => setBgOpen((o) => !o)} className="btn btn-ghost !border-white/15 !bg-black/25 !py-2 !text-xs backdrop-blur">
            <ImageIcon size={14} /> Fond
          </button>
          {bgOpen && (
            <div className="absolute right-0 mt-2 grid w-64 grid-cols-3 gap-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    update((l) => ({ ...l, bg: b.id }));
                    setBgOpen(false);
                  }}
                  className={`flex h-16 items-end rounded-xl p-1.5 text-[10px] font-semibold text-white ${layout.bg === b.id ? "ring-2 ring-[var(--color-teal)]" : ""}`}
                  style={{ background: b.css }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={toggleFull} className="btn btn-ghost !border-white/15 !bg-black/25 !py-2 !text-xs backdrop-blur">
          {full ? <Minimize size={14} /> : <Maximize size={14} />} {full ? "Quitter le plein écran" : "Plein écran"}
        </button>
      </div>

      {/* Widgets */}
      {layout.widgets.map((w) => {
        const item = CATALOG.find((c) => c.type === w.type);
        if (!item) return null;
        const Comp = item.component;
        return (
          <div
            key={w.id}
            data-widget
            className="group/widget absolute rounded-3xl border border-white/10 bg-[var(--color-panel)]/92 shadow-2xl backdrop-blur"
            style={{ left: w.x, top: w.y, zIndex: w.z ?? 0, transform: `scale(${w.scale})`, transformOrigin: "top left" }}
            onPointerDown={() => toFront(w.id)}
          >
            <div
              className="flex cursor-grab touch-none items-center gap-1 rounded-t-3xl px-3 pt-2 pb-1 text-[var(--color-ink-faint)] active:cursor-grabbing"
              onPointerDown={(e) => onMoveStart(e, w)}
            >
              <GripHorizontal size={15} />
              <span className="text-xs font-semibold">{item.label}</span>
              <span
                className="ml-auto flex items-center gap-0.5"
                onPointerDown={(e) => {
                  // Pas de déplacement depuis les boutons, mais on passe quand même le widget au premier plan.
                  e.stopPropagation();
                  toFront(w.id);
                }}
              >
                <button type="button" onClick={(e) => setScale(w, w.scale / 1.2, e.currentTarget)} className="rounded p-1 hover:text-[var(--color-ink)]" aria-label="Réduire">
                  <Minus size={13} />
                </button>
                <button type="button" onClick={(e) => setScale(w, w.scale * 1.2, e.currentTarget)} className="rounded p-1 hover:text-[var(--color-ink)]" aria-label="Agrandir">
                  <Plus size={13} />
                </button>
                <button type="button" onClick={() => update((l) => ({ ...l, widgets: l.widgets.filter((x) => x.id !== w.id) }))} className="rounded p-1 hover:text-[var(--color-coral)]" aria-label="Fermer">
                  <X size={14} />
                </button>
              </span>
            </div>
            <div className="px-5 pt-1 pb-5">
              <Comp data={w.data} setData={(data: unknown) => patchWidget(w.id, { data })} classeSlug={classe?.slug ?? ""} classeLabel={classe?.label ?? ""} />
            </div>
            {/* Poignée de redimensionnement (double-clic : taille d'origine) */}
            <div
              role="slider"
              aria-label="Redimensionner"
              aria-valuemin={MIN_SCALE * 100}
              aria-valuemax={MAX_SCALE * 100}
              aria-valuenow={Math.round(w.scale * 100)}
              title="Tirer pour agrandir ou réduire — double-clic : taille d'origine"
              onPointerDown={(e) => onResizeStart(e, w)}
              onDoubleClick={() => patchWidget(w.id, { scale: 1 })}
              className="absolute right-0 bottom-0 flex h-7 w-7 cursor-nwse-resize touch-none items-end justify-end rounded-br-3xl p-1.5 text-white/30 transition group-hover/widget:text-white/70"
            >
              <svg viewBox="0 0 10 10" className="h-3 w-3" aria-hidden="true">
                <path d="M9 1 1 9M9 5 5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        );
      })}

      {layout.widgets.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-lg text-white/60">Ajoute un outil depuis la barre du bas.</p>
      )}

      {/* Dock */}
      <div className="absolute inset-x-0 bottom-4 z-[10000] flex justify-center px-3">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[var(--color-bg-deep)]/85 p-1.5 shadow-2xl backdrop-blur">
          {CATALOG.map((c) => {
            const Icon = c.icon;
            return (
              <button key={c.type} type="button" onClick={() => add(c.type)} className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[var(--color-ink-soft)] transition hover:bg-white/10 hover:text-[var(--color-teal)]">
                <Icon size={20} />
                <span className="text-[10px] leading-none font-medium whitespace-nowrap">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Dices, Mic, MicOff, Pause, Play, RotateCcw, Shuffle, Users } from "lucide-react";

/* eslint-disable react-hooks/set-state-in-effect */

export type WidgetProps<T> = { data: T; setData: (d: T) => void; classeSlug: string; classeLabel: string };

// ------------------------------------------------------------ Son (WebAudio)

function beep(times = 3) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.45;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.start(t);
      o.stop(t + 0.4);
    }
    setTimeout(() => ctx.close(), times * 500 + 200);
  } catch {
    // audio indisponible
  }
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
};

// ------------------------------------------------------------ Minuteur

export type TimerData = { duration: number };

export function TimerWidget({ data, setData }: WidgetProps<TimerData>) {
  const [left, setLeft] = useState(data.duration * 1000);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const l = endRef.current - Date.now();
      if (l <= 0) {
        setLeft(0);
        setRunning(false);
        setDone(true);
        beep();
      } else setLeft(l);
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  const setDuration = (sec: number) => {
    setData({ duration: sec });
    setLeft(sec * 1000);
    setRunning(false);
    setDone(false);
  };
  const start = () => {
    if (left <= 0) return;
    endRef.current = Date.now() + left;
    setRunning(true);
    setDone(false);
  };
  const pct = data.duration ? left / (data.duration * 1000) : 0;
  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <div className={`flex w-72 flex-col items-center gap-3 ${done ? "animate-pulse" : ""}`}>
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={R} fill="none" stroke="var(--color-line)" strokeWidth="10" />
          <circle cx="80" cy="80" r={R} fill="none" stroke={done ? "var(--color-coral)" : pct < 0.2 ? "var(--color-sun)" : "var(--color-teal)"} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: "stroke-dashoffset 0.2s linear" }} />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-5xl font-bold tabular-nums ${done ? "text-[var(--color-coral)]" : "text-[var(--color-ink)]"}`}>{fmt(left)}</span>
      </div>
      {!running && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {[1, 2, 3, 5, 10, 15].map((m) => (
            <button key={m} type="button" onClick={() => setDuration(m * 60)} className={`chip !px-2.5 !py-0.5 !text-xs ${data.duration === m * 60 ? "chip-on" : ""}`}>
              {m} min
            </button>
          ))}
          <label className="chip !px-2 !py-0.5 !text-xs">
            <input
              type="number"
              min={1}
              max={180}
              placeholder="…"
              className="w-10 bg-transparent text-center outline-none"
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v > 0) setDuration(Math.min(180, v) * 60);
              }}
            />
            min
          </label>
        </div>
      )}
      <div className="flex gap-2">
        {running ? (
          <button type="button" onClick={() => setRunning(false)} className="btn btn-ghost">
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button type="button" onClick={start} disabled={left <= 0} className="btn btn-primary">
            <Play size={16} /> {left < data.duration * 1000 && left > 0 ? "Reprendre" : "Démarrer"}
          </button>
        )}
        <button type="button" onClick={() => setDuration(data.duration)} className="btn btn-ghost" aria-label="Remettre à zéro">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Chronomètre

export function StopwatchWidget() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
    return () => clearInterval(id);
  }, [running]);
  const s = Math.floor(elapsed / 1000);
  return (
    <div className="flex w-64 flex-col items-center gap-3">
      <span className="text-5xl font-bold tabular-nums text-[var(--color-ink)]">
        {pad(Math.floor(s / 60))}:{pad(s % 60)}
        <span className="text-2xl text-[var(--color-ink-faint)]">.{Math.floor((elapsed % 1000) / 100)}</span>
      </span>
      <div className="flex gap-2">
        {running ? (
          <button type="button" onClick={() => setRunning(false)} className="btn btn-ghost">
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              startRef.current = Date.now() - elapsed;
              setRunning(true);
            }}
            className="btn btn-primary"
          >
            <Play size={16} /> {elapsed ? "Reprendre" : "Démarrer"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
          }}
          className="btn btn-ghost"
          aria-label="Remettre à zéro"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Horloge + date en espagnol

export type ClockData = { lang: "es" | "fr" };

export function ClockWidget({ data, setData }: WidgetProps<ClockData>) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <div className="h-32 w-72" />;
  const locale = data.lang === "es" ? "es-ES" : "fr-FR";
  const date = now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="flex w-80 flex-col items-center gap-1 text-center">
      <span className="text-6xl font-bold tabular-nums text-[var(--color-ink)]">
        {pad(now.getHours())}:{pad(now.getMinutes())}
      </span>
      <span className="text-lg text-[var(--color-ink-soft)]">
        {data.lang === "es" ? "Hoy es " : "Nous sommes le "}
        <span className="font-semibold text-[var(--color-teal)]">{date}</span>
      </span>
      <div className="mt-2 flex gap-1.5">
        <button type="button" onClick={() => setData({ lang: "es" })} className={`chip !py-0.5 !text-xs ${data.lang === "es" ? "chip-on" : ""}`}>
          Español
        </button>
        <button type="button" onClick={() => setData({ lang: "fr" })} className={`chip !py-0.5 !text-xs ${data.lang === "fr" ? "chip-on" : ""}`}>
          Français
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Liste de prénoms (sur cet appareil)

const NAMES_KEY = "tableau-prenoms";

function readNames(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(NAMES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Prénoms d'une classe, gardés uniquement dans ce navigateur. */
function useNames(classeSlug: string) {
  const [raw, setRaw] = useState("");
  useEffect(() => {
    setRaw(readNames()[classeSlug] ?? "");
  }, [classeSlug]);
  const save = (v: string) => {
    setRaw(v);
    try {
      window.localStorage.setItem(NAMES_KEY, JSON.stringify({ ...readNames(), [classeSlug]: v }));
    } catch {
      // stockage indisponible
    }
  };
  const names = useMemo(() => raw.split(/[\n,;]+/).map((n) => n.trim()).filter(Boolean), [raw]);
  return { raw, save, names };
}

function NamesEditor({ raw, save, classeLabel, onClose }: { raw: string; save: (v: string) => void; classeLabel: string; onClose: () => void }) {
  return (
    <div className="flex w-72 flex-col gap-2">
      <p className="text-sm font-semibold text-[var(--color-ink)]">Prénoms de la {classeLabel}</p>
      <textarea value={raw} onChange={(e) => save(e.target.value)} rows={8} className="field resize-y" placeholder={"Un prénom par ligne\nLéa\nYanis\n…"} autoFocus />
      <p className="text-xs text-[var(--color-ink-faint)]">Gardés uniquement sur cet ordinateur, jamais envoyés en ligne.</p>
      <button type="button" onClick={onClose} className="btn btn-primary">
        OK
      </button>
    </div>
  );
}

export type PickerData = { withoutRepeat: boolean };

export function PickerWidget({ data, setData, classeSlug, classeLabel }: WidgetProps<PickerData>) {
  const { raw, save, names } = useNames(classeSlug);
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setPicked([]);
    setCurrent(null);
  }, [classeSlug]);

  const pool = data.withoutRepeat ? names.filter((n) => !picked.includes(n)) : names;

  function pick() {
    if (pool.length === 0) return;
    setSpinning(true);
    let i = 0;
    const id = setInterval(() => {
      setCurrent(pool[Math.floor(Math.random() * pool.length)]);
      if (++i > 14) {
        clearInterval(id);
        const final = pool[Math.floor(Math.random() * pool.length)];
        setCurrent(final);
        setPicked((p) => [...p, final]);
        setSpinning(false);
      }
    }, 70);
  }

  if (editing || names.length === 0) {
    return names.length === 0 && !editing ? (
      <div className="flex w-72 flex-col items-center gap-3 text-center">
        <p className="text-sm text-[var(--color-ink-soft)]">Ajoute les prénoms de la {classeLabel} pour tirer au sort.</p>
        <button type="button" onClick={() => setEditing(true)} className="btn btn-primary">
          Saisir les prénoms
        </button>
      </div>
    ) : (
      <NamesEditor raw={raw} save={save} classeLabel={classeLabel} onClose={() => setEditing(false)} />
    );
  }

  return (
    <div className="flex w-80 flex-col items-center gap-3 text-center">
      <span className={`flex min-h-20 items-center text-5xl font-bold ${spinning ? "text-[var(--color-ink-soft)]" : "text-[var(--color-sun)]"}`}>{current ?? "¿Quién?"}</span>
      <button type="button" onClick={pick} disabled={spinning || pool.length === 0} className="btn btn-primary">
        <Shuffle size={16} /> Tirer au sort
      </button>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--color-ink-faint)]">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={data.withoutRepeat} onChange={(e) => setData({ withoutRepeat: e.target.checked })} className="accent-[var(--color-teal)]" />
          Sans remise
        </label>
        {data.withoutRepeat && (
          <>
            <span>· reste {pool.length}/{names.length}</span>
            <button type="button" onClick={() => setPicked([])} className="hover:text-[var(--color-teal)]">
              · recommencer
            </button>
          </>
        )}
        <button type="button" onClick={() => setEditing(true)} className="hover:text-[var(--color-teal)]">
          · prénoms
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Groupes

export type GroupsData = { size: number };

function shuffle<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function GroupsWidget({ data, setData, classeSlug, classeLabel }: WidgetProps<GroupsData>) {
  const { raw, save, names } = useNames(classeSlug);
  const [editing, setEditing] = useState(false);
  const [groups, setGroups] = useState<string[][]>([]);

  function make() {
    const s = shuffle(names);
    const n = Math.max(1, Math.round(s.length / data.size));
    const out: string[][] = Array.from({ length: n }, () => []);
    s.forEach((name, i) => out[i % n].push(name));
    setGroups(out);
  }

  if (editing || names.length === 0) {
    return names.length === 0 && !editing ? (
      <div className="flex w-72 flex-col items-center gap-3 text-center">
        <p className="text-sm text-[var(--color-ink-soft)]">Ajoute les prénoms de la {classeLabel} pour faire des groupes.</p>
        <button type="button" onClick={() => setEditing(true)} className="btn btn-primary">
          Saisir les prénoms
        </button>
      </div>
    ) : (
      <NamesEditor raw={raw} save={save} classeLabel={classeLabel} onClose={() => setEditing(false)} />
    );
  }

  const colors = ["var(--color-teal)", "var(--color-sun)", "var(--color-coral)", "var(--color-blue)"];
  return (
    <div className="flex max-w-[40rem] min-w-80 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--color-ink-soft)]">Groupes de</span>
        {[2, 3, 4, 5, 6].map((n) => (
          <button key={n} type="button" onClick={() => setData({ size: n })} className={`chip !px-2.5 !py-0.5 !text-xs ${data.size === n ? "chip-on" : ""}`}>
            {n}
          </button>
        ))}
        <button type="button" onClick={make} className="btn btn-primary ml-auto !py-1.5">
          <Users size={15} /> Former
        </button>
      </div>
      {groups.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {groups.map((g, i) => (
            <div key={i} className="rounded-xl border p-2.5" style={{ borderColor: `color-mix(in srgb, ${colors[i % 4]} 50%, transparent)` }}>
              <p className="text-xs font-bold" style={{ color: colors[i % 4] }}>
                Grupo {i + 1}
              </p>
              <p className="mt-1 text-sm leading-snug text-[var(--color-ink)]">{g.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={() => setEditing(true)} className="self-start text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-teal)]">
        Modifier les prénoms ({names.length})
      </button>
    </div>
  );
}

// ------------------------------------------------------------ Feu tricolore

export type LightData = { on: "red" | "orange" | "green" };

export function TrafficLightWidget({ data, setData }: WidgetProps<LightData>) {
  const lights = [
    { id: "red", color: "#f2685a", label: "Silencio" },
    { id: "orange", color: "#f6b733", label: "Susurrar" },
    { id: "green", color: "#2ad1b6", label: "Hablar" },
  ] as const;
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-2.5 rounded-3xl bg-black/60 p-3">
        {lights.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setData({ on: l.id })}
            aria-label={l.label}
            className="h-16 w-16 rounded-full transition"
            style={{ background: data.on === l.id ? l.color : `color-mix(in srgb, ${l.color} 18%, #111)`, boxShadow: data.on === l.id ? `0 0 28px ${l.color}` : "none" }}
          />
        ))}
      </div>
      <span className="text-3xl font-bold" style={{ color: lights.find((l) => l.id === data.on)?.color }}>
        {lights.find((l) => l.id === data.on)?.label}
      </span>
    </div>
  );
}

// ------------------------------------------------------------ Consignes de travail (bilingues)

export const WORK_MODES = [
  { id: "silencio", es: "En silencio", fr: "En silence", emoji: "🤫", color: "#f2685a" },
  { id: "susurrar", es: "Susurrando", fr: "En chuchotant", emoji: "🗣️", color: "#f6b733" },
  { id: "parejas", es: "En parejas", fr: "En binôme", emoji: "👥", color: "#3d7ff0" },
  { id: "grupo", es: "En grupo", fr: "En groupe", emoji: "🧩", color: "#a78bfa" },
  { id: "mano", es: "Levanta la mano", fr: "Lève la main", emoji: "✋", color: "#2ad1b6" },
  { id: "escucha", es: "Escucha", fr: "Écoute", emoji: "👂", color: "#2ad1b6" },
  { id: "escribe", es: "Escribe", fr: "Écris", emoji: "✍️", color: "#f6b733" },
  { id: "lee", es: "Lee", fr: "Lis", emoji: "📖", color: "#3d7ff0" },
];

export type WorkData = { mode: string };

export function WorkModeWidget({ data, setData }: WidgetProps<WorkData>) {
  const m = WORK_MODES.find((x) => x.id === data.mode) ?? WORK_MODES[0];
  return (
    <div className="flex w-80 flex-col items-center gap-3 text-center">
      <span className="flex h-28 w-28 items-center justify-center rounded-full text-6xl" style={{ background: `color-mix(in srgb, ${m.color} 20%, transparent)`, boxShadow: `0 0 0 4px ${m.color}` }}>
        {m.emoji}
      </span>
      <span className="text-4xl font-bold" style={{ color: m.color }}>
        {m.es}
      </span>
      <span className="-mt-2 text-sm text-[var(--color-ink-soft)]">{m.fr}</span>
      <div className="flex justify-center gap-1">
        {WORK_MODES.map((x) => (
          <button key={x.id} type="button" onClick={() => setData({ mode: x.id })} title={x.es} className={`h-8 w-8 rounded-full text-base transition ${x.id === m.id ? "bg-[var(--color-ink)]/15 ring-2 ring-[var(--color-teal)]" : "hover:bg-[var(--color-ink)]/10"}`}>
            {x.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Sonomètre

export type SoundData = { threshold: number };

export function SoundWidget({ data, setData }: WidgetProps<SoundData>) {
  const [level, setLevel] = useState(0);
  const [on, setOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => () => stopRef.current(), []);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let raf = 0;
      let smooth = 0;
      const loop = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / buf.length);
        smooth = smooth * 0.85 + Math.min(100, rms * 300) * 0.15;
        setLevel(smooth);
        raf = requestAnimationFrame(loop);
      };
      loop();
      stopRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();
      };
      setOn(true);
    } catch {
      setError("Micro refusé ou indisponible.");
    }
  }

  function stop() {
    stopRef.current();
    setOn(false);
    setLevel(0);
  }

  const over = level > data.threshold;
  return (
    <div className="flex w-72 flex-col items-center gap-3">
      <span className={`text-5xl transition ${over ? "scale-110" : ""}`}>{!on ? "🎙️" : over ? "🙉" : level > data.threshold * 0.6 ? "😐" : "😊"}</span>
      <div className="relative h-5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
        <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${level}%`, background: over ? "var(--color-coral)" : level > data.threshold * 0.6 ? "var(--color-sun)" : "var(--color-teal)" }} />
        <div className="absolute top-0 h-full w-0.5 bg-[var(--color-ink)]" style={{ left: `${data.threshold}%` }} />
      </div>
      {over && <span className="text-xl font-bold text-[var(--color-coral)]">¡Más bajo, por favor!</span>}
      <label className="flex w-full items-center gap-2 text-xs text-[var(--color-ink-faint)]">
        Seuil
        <input type="range" min={10} max={90} value={data.threshold} onChange={(e) => setData({ threshold: Number(e.target.value) })} className="flex-1 accent-[var(--color-teal)]" />
      </label>
      <button type="button" onClick={on ? stop : start} className={`btn ${on ? "btn-ghost" : "btn-primary"}`}>
        {on ? <MicOff size={16} /> : <Mic size={16} />} {on ? "Arrêter" : "Activer le micro"}
      </button>
      {error && <span className="text-xs text-[var(--color-coral)]">{error}</span>}
    </div>
  );
}

// ------------------------------------------------------------ Texte / consigne

export type TextData = { text: string; size: number };

export function TextWidget({ data, setData }: WidgetProps<TextData>) {
  return (
    <div className="flex w-96 flex-col gap-2">
      <textarea
        value={data.text}
        onChange={(e) => setData({ ...data, text: e.target.value })}
        rows={4}
        placeholder="Écris une consigne, les devoirs, un mot du jour…"
        className="w-full resize-y rounded-xl bg-transparent p-1 leading-snug font-semibold text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
        style={{ fontSize: `${data.size}px` }}
      />
      <div className="flex gap-1.5">
        {[20, 28, 40, 56].map((s) => (
          <button key={s} type="button" onClick={() => setData({ ...data, size: s })} className={`chip !px-2 !py-0.5 !text-xs ${data.size === s ? "chip-on" : ""}`}>
            {s === 20 ? "A" : s === 28 ? "A+" : s === 40 ? "A++" : "A+++"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Dés

export type DiceData = { count: number };
const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceWidget({ data, setData }: WidgetProps<DiceData>) {
  const [values, setValues] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  function roll() {
    setRolling(true);
    let i = 0;
    const id = setInterval(() => {
      setValues(Array.from({ length: data.count }, () => Math.floor(Math.random() * 6)));
      if (++i > 10) {
        clearInterval(id);
        setRolling(false);
      }
    }, 60);
  }
  const shown = values.length === data.count ? values : Array.from({ length: data.count }, () => 5);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 text-8xl leading-none text-[var(--color-ink)]">
        {shown.map((v, i) => (
          <span key={i} className={rolling ? "animate-bounce" : ""}>
            {FACES[v]}
          </span>
        ))}
      </div>
      {!rolling && values.length === data.count && data.count > 1 && (
        <span className="text-sm text-[var(--color-ink-soft)]">Total : {values.reduce((a, b) => a + b + 1, 0)}</span>
      )}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <button key={n} type="button" onClick={() => setData({ count: n })} className={`chip !px-2.5 !py-0.5 !text-xs ${data.count === n ? "chip-on" : ""}`}>
            {n} dé{n > 1 ? "s" : ""}
          </button>
        ))}
        <button type="button" onClick={roll} disabled={rolling} className="btn btn-primary !py-1.5">
          <Dices size={16} /> Lancer
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ QR code

export type QrData = { url: string };

export function QrWidget({ data, setData, classeSlug }: WidgetProps<QrData>) {
  const [svg, setSvg] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = data.url || (origin ? `${origin}/matiere/espagnol/${classeSlug}` : "");
  useEffect(() => {
    if (!url) return;
    QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#0b1633", light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [url]);
  return (
    <div className="flex w-64 flex-col items-center gap-2">
      <div className="w-56 overflow-hidden rounded-2xl bg-white p-2" dangerouslySetInnerHTML={{ __html: svg }} />
      <input value={data.url} onChange={(e) => setData({ url: e.target.value })} placeholder="Espace de la classe (par défaut)" className="field !py-1.5 !text-xs" />
      <span className="max-w-full truncate text-[11px] text-[var(--color-ink-faint)]">{url}</span>
    </div>
  );
}

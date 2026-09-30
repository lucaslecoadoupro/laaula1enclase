"use client";

import { useState } from "react";
import { FileText, Pause, Volume2 } from "lucide-react";
import type { RemiseModule } from "@/lib/remise/content";
import { useProgress } from "@/lib/remise/progress";
import { useSpeech } from "./useSpeech";

/**
 * Audio du module. Tant que l'enregistrement n'existe pas (src = null), on
 * propose la voix de synthèse espagnole du navigateur. La transcription reste
 * accessible, mais si elle est lue sans écoute, la compréhension orale est
 * marquée « non évaluée » (règle du kit).
 */
export default function AudioBlock({ module: m }: { module: RemiseModule }) {
  const { speak, stop, speaking, supported } = useSpeech();
  const { progress, update } = useProgress();
  const [showTranscript, setShowTranscript] = useState(false);
  const status = progress.listening[m.id];

  const markListened = () => update((p) => ({ ...p, listening: { ...p.listening, [m.id]: "listened" } }));

  function revealTranscript() {
    setShowTranscript(true);
    if (!status) update((p) => ({ ...p, listening: { ...p.listening, [m.id]: "read-only" } }));
  }

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-deep)] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="icon-tile h-10 w-10 bg-[var(--color-teal)]/12 text-[var(--color-teal)]">
          <Volume2 size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--color-ink)]">Écouter {m.audio.id}</p>
          <p className="text-xs text-[var(--color-ink-faint)]">
            {m.audio.src
              ? "Enregistrement du professeur"
              : supported === false
                ? "Lecture sonore indisponible sur cet appareil : utilise le mode lecture."
                : "Voix de synthèse, en attendant l'enregistrement du professeur."}
          </p>
        </div>
        {!m.audio.src && supported !== false && (
          <button
            type="button"
            onClick={() => {
              if (speaking) return stop();
              speak(m.audio.transcript);
              markListened();
            }}
            disabled={!supported}
            className="btn btn-primary !py-2"
          >
            {speaking ? <Pause size={15} /> : <Volume2 size={15} />} {speaking ? "Arrêter" : "Écouter"}
          </button>
        )}
      </div>
      {m.audio.src && (
        <audio src={m.audio.src} controls className="mt-3 w-full" onPlay={markListened} />
      )}
      <div className="mt-3 border-t border-[var(--color-line)] pt-3">
        {showTranscript ? (
          <p className="prose-lite text-sm text-[var(--color-ink)]">{m.audio.transcript}</p>
        ) : (
          <button type="button" onClick={revealTranscript} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-teal)]">
            <FileText size={13} /> {status === "listened" ? "Vérifier avec la transcription" : "Mode lecture (transcription)"}
          </button>
        )}
        {status === "read-only" && (
          <p className="mt-2 text-xs text-[var(--color-sun)]">Transcription lue sans écoute : la compréhension orale n&apos;est pas évaluée.</p>
        )}
      </div>
    </div>
  );
}

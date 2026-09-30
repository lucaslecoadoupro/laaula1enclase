"use client";

import { useCallback, useEffect, useState } from "react";

/** Voix de synthèse espagnole du navigateur (modèle sonore en attendant les enregistrements). */
export function useSpeech() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      const t = setTimeout(() => setSupported(false), 0);
      return () => clearTimeout(t);
    }
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      const es = voices.find((v) => v.lang === "es-ES") ?? voices.find((v) => v.lang.startsWith("es"));
      setVoice(es ?? null);
      setSupported(!!es);
    };
    // Les voix se chargent souvent après coup (événement voiceschanged).
    const t = setTimeout(pick, 0);
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => {
      clearTimeout(t);
      window.speechSynthesis.removeEventListener("voiceschanged", pick);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, rate = 0.9) => {
      if (!voice) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, " "));
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = rate;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [voice]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, stop };
}

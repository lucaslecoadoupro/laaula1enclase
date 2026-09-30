import { EyeOff } from "lucide-react";

export default function DraftBanner() {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-2xl border border-[var(--color-sun)]/40 bg-[var(--color-sun)]/10 px-4 py-2.5 text-sm text-[var(--color-sun)]">
      <EyeOff size={16} /> Brouillon — tu le vois parce que tu es connecté en professeur, les élèves ne le voient pas encore.
    </div>
  );
}

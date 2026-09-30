import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col gap-3 border-t border-[var(--color-line-soft)] py-7 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5 text-[var(--color-ink-soft)]">
          <BrandMark size={22} />
          <span>© Lucas Le Coadou — Professeur d&apos;espagnol dans l&apos;académie de Montpellier</span>
        </p>
        <Link href="/admin" className="font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
          Espace enseignant
        </Link>
      </div>
    </footer>
  );
}

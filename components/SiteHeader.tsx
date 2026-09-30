"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "@/components/BrandMark";

const TABS = [
  { href: "/", label: "Mes classes", match: (p: string) => p === "/" || p.startsWith("/matiere") || p.startsWith("/login") },
  { href: "/actualites", label: "Actualités", match: (p: string) => p.startsWith("/actualites") },
  { href: "/ressources", label: "Ressources", match: (p: string) => p.startsWith("/ressources") },
  { href: "/lce", label: "LCE", match: (p: string) => p.startsWith("/lce") },
];

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="relative z-20 border-b border-[var(--color-line-soft)] bg-[var(--color-bg-deep)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3.5 sm:gap-10 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <BrandMark size={34} />
          <span className="text-lg leading-none font-bold tracking-tight text-[var(--color-ink)] sm:text-xl">
            <span className="hidden sm:inline">El aula 1 </span><span className="hidden font-medium text-[var(--color-ink-soft)] sm:inline">en casa</span>
          </span>
        </Link>
        <nav className="flex min-w-0 items-center gap-3 sm:gap-7">
          {isAdmin ? (
            <Link href="/admin" className="nav-tab nav-tab-active">
              Espace enseignant
            </Link>
          ) : (
            TABS.map((t) => (
              <Link key={t.href} href={t.href} className={`nav-tab ${t.match(pathname) ? "nav-tab-active" : ""}`}>
                {t.label}
              </Link>
            ))
          )}
        </nav>
      </div>
    </header>
  );
}

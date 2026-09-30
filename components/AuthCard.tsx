import type { ReactNode } from "react";

export default function AuthCard({
  icon,
  eyebrow,
  title,
  children,
  note,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4 py-16">
      <div className="card rise-in rounded-3xl p-8">
        <span className="icon-tile h-12 w-12 bg-[var(--color-teal)]/12 text-[var(--color-teal)]">{icon}</span>
        <p className="mt-5 text-sm font-semibold text-[var(--color-teal)]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-ink)]">{title}</h1>
        {note && <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">{note}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export default function StatusBadge({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="rounded-full bg-[var(--color-teal)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-teal)]">Publié</span>
  ) : (
    <span className="rounded-full bg-[var(--color-line)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-soft)]">Brouillon</span>
  );
}

import { classes } from "@/lib/classes";

export default function ClassBadges({ slugs }: { slugs: string[] }) {
  const labels = classes.filter((c) => slugs.includes(c.classeSlug)).map((c) => c.classeLabel);
  return (
    <span className="flex flex-wrap gap-1">
      {labels.map((l) => (
        <span key={l} className="rounded-md bg-[var(--color-teal)]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-teal)]">
          {l}
        </span>
      ))}
    </span>
  );
}

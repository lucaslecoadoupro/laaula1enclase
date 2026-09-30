import type { Metadata } from "next";
import { classes } from "@/lib/classes";
import TableauApp from "@/components/tableau/TableauApp";

export const metadata: Metadata = { title: "Tableau de classe — El aula 1 en casa" };

/** Tableau à projeter en classe (réservé au professeur connecté, cf. proxy.ts). */
export default function TableauPage() {
  return <TableauApp classes={classes.map((c) => ({ slug: c.classeSlug, label: c.classeLabel }))} />;
}

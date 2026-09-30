import { NextRequest, NextResponse } from "next/server";
import { deleteFichiers } from "@/lib/blob-cleanup";
import { isBlobUrl } from "@/lib/fichier";
import { DEFAULT_PARCOURS, type RemiseModule } from "@/lib/remise/content";
import { deleteOverride, getOverride, setOverride } from "@/lib/remise/repo";
import { sanitizeModule } from "@/lib/remise/sanitize";

type Ctx = { params: Promise<{ id: string }> };

/** Efface l'ancien audio du stockage s'il a été remplacé ou retiré. */
async function cleanupAudio(oldSrc: string | null | undefined, newSrc: string | null | undefined) {
  if (oldSrc && oldSrc !== newSrc && isBlobUrl(oldSrc)) {
    await deleteFichiers([{ url: oldSrc, pathname: "", contentType: "", taille: 0, nom: "" }]);
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const base = DEFAULT_PARCOURS.modules.find((m) => m.id === id);
  if (!base) return NextResponse.json({ error: "Module introuvable." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const mod = sanitizeModule(body?.module, base);
  if (!mod) return NextResponse.json({ error: "Contenu invalide (le titre est requis)." }, { status: 400 });
  if (mod.activities.filter((a) => a.phase === "training").length === 0) {
    return NextResponse.json({ error: "Il faut au moins une question d'entraînement complète (énoncé + deux choix)." }, { status: 400 });
  }
  if (mod.activities.filter((a) => a.phase === "exit").length === 0) {
    return NextResponse.json({ error: "Il faut une question de sortie complète." }, { status: 400 });
  }
  const previous = await getOverride<RemiseModule>(`module:${id}`);
  await setOverride(`module:${id}`, mod);
  await cleanupAudio(previous?.audio?.src, mod.audio.src);
  return NextResponse.json({ ok: true, module: mod });
}

/** Remet le module dans sa version d'origine (kit Conexión). */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const previous = await getOverride<RemiseModule>(`module:${id}`);
  await deleteOverride(`module:${id}`);
  await cleanupAudio(previous?.audio?.src, null);
  return NextResponse.json({ ok: true });
}

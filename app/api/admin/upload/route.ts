import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE } from "@/lib/file-kinds";

/**
 * Délivre au navigateur un jeton d'upload temporaire vers Vercel Blob.
 * Le fichier part ensuite directement du navigateur vers Blob (pas de limite
 * des 4,5 Mo des fonctions Vercel). Route protégée par proxy.ts (cookie admin).
 * Pas de `onUploadCompleted` : c'est le navigateur qui enregistre ensuite le
 * fichier sur le cours ou l'exercice.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_FILE_SIZE,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur d'upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

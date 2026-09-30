import { NextRequest, NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import { handleUpload, handleUploadPresigned, type HandleUploadBody, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { ensureBlobEnv } from "@/lib/blob-env";
import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE } from "@/lib/file-kinds";

/**
 * Envoi de fichiers du navigateur vers Vercel Blob (route protégée par
 * proxy.ts : cookie admin requis). Deux méthodes, choisies selon les
 * identifiants disponibles :
 * - « token » : jeton BLOB_READ_WRITE_TOKEN → handleUpload (méthode classique) ;
 * - « presigned » : seulement le store (authentification OIDC par défaut de
 *   Vercel) → handleUploadPresigned, qui n'a pas besoin du jeton.
 * Le fichier part directement du navigateur vers Blob (pas de limite des 4,5 Mo).
 */

/** Indique au navigateur quelle méthode utiliser. */
export async function GET() {
  const { uploadMode } = ensureBlobEnv();
  return NextResponse.json({ mode: uploadMode });
}

export async function POST(request: NextRequest) {
  const { uploadMode } = ensureBlobEnv();
  const body = await request.json();

  try {
    if (body?.type === "blob.generate-presigned-url") {
      const json = await handleUploadPresigned({
        body: body as HandleUploadPresignedBody,
        request,
        getSignedToken: async (pathname) => ({
          token: await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_FILE_SIZE,
            validUntil: Date.now() + 15 * 60 * 1000,
          }),
          urlOptions: {
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_FILE_SIZE,
            addRandomSuffix: true,
            allowOverwrite: false,
            validUntil: Date.now() + 15 * 60 * 1000,
          },
        }),
      });
      return NextResponse.json(json);
    }

    if (uploadMode === "none") {
      return NextResponse.json({ error: "Stockage non configuré : aucun store Blob n'est connecté au projet." }, { status: 400 });
    }

    const json = await handleUpload({
      body: body as HandleUploadBody,
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

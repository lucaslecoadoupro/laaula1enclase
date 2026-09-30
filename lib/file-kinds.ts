// Types de fichiers acceptés pour les documents partagés, et comment les
// prévisualiser côté élève. Importable côté client comme côté serveur.

export const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/msword",
  "application/vnd.ms-powerpoint",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.presentation",
];

/** Taille max d'un fichier : 50 Mo. */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export type FileKind = "pdf" | "image" | "audio" | "video" | "office" | "other";

export function fileKind(contentType: string, pathname = ""): FileKind {
  const ct = contentType.toLowerCase();
  const ext = pathname.toLowerCase().split(".").pop() ?? "";
  if (ct === "application/pdf" || ext === "pdf") return "pdf";
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("audio/")) return "audio";
  if (ct.startsWith("video/")) return "video";
  if (
    ["docx", "pptx", "xlsx", "doc", "ppt", "xls"].includes(ext) ||
    ct.includes("officedocument") ||
    ct.includes("msword") ||
    ct.includes("ms-powerpoint")
  ) {
    return "office";
  }
  return "other";
}

export function kindLabel(kind: FileKind): string {
  return { pdf: "PDF", image: "Image", audio: "Audio", video: "Vidéo", office: "Document", other: "Fichier" }[kind];
}

export function formatSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

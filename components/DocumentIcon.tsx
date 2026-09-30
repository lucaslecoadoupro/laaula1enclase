import { FileAudio, FileImage, FileText, FileVideo, File, Presentation } from "lucide-react";
import type { FileKind } from "@/lib/file-kinds";

export default function DocumentIcon({ kind, size = 18 }: { kind: FileKind; size?: number }) {
  switch (kind) {
    case "pdf":
      return <FileText size={size} />;
    case "image":
      return <FileImage size={size} />;
    case "audio":
      return <FileAudio size={size} />;
    case "video":
      return <FileVideo size={size} />;
    case "office":
      return <Presentation size={size} />;
    default:
      return <File size={size} />;
  }
}

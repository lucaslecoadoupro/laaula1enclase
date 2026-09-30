import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DIGIPAD_URL = "https://digipad.app/p/849561/41934e401132b";

export default function LcePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        title="Langue et culture européenne"
        subtitle="Le mur collaboratif de la classe, sur Digipad."
        aside={
          <a href={DIGIPAD_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Ouvrir dans un nouvel onglet
            <ExternalLink size={15} />
          </a>
        }
      />
      <div className="card mt-8 overflow-hidden rounded-2xl">
        <iframe
          src={DIGIPAD_URL}
          title="Digipad — Langue et culture européenne"
          className="h-[72vh] w-full bg-white"
          style={{ border: 0 }}
          allow="camera; microphone; geolocation"
        />
      </div>
    </main>
  );
}

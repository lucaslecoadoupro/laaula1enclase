import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HideOn from "@/components/HideOn";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "El aula 1 en casa",
  description: "Cours d'espagnol, séquences, corrigés et remise à niveau.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${lexend.variable} h-full antialiased`}>
      <body className="relative min-h-full overflow-x-hidden">
        {/* Cercles décoratifs, comme sur Focus */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-[var(--color-navy-glow)]/70" />
          <div className="absolute -bottom-40 -left-32 h-[20rem] w-[20rem] rounded-full bg-[#3a3a2b]/60" />
        </div>
        <div className="relative flex min-h-screen flex-col">
          <HideOn prefix="/tableau">
            <SiteHeader />
          </HideOn>
          <div className="relative z-10 flex-1">{children}</div>
          <HideOn prefix="/tableau">
            <SiteFooter />
          </HideOn>
        </div>
      </body>
    </html>
  );
}

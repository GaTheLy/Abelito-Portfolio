import type { Metadata } from "next";
import { Inter, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

// UI chrome + agent pages.
const inter = Inter({ variable: "--font-sans-var", subsets: ["latin"] });
// Reserved for /origin only — signals "this is personal, not a system talking".
const fraunces = Fraunces({
  variable: "--font-voice-var",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
// Routing readout + small system chrome.
const geistMono = Geist_Mono({ variable: "--font-mono-var", subsets: ["latin"] });

export const metadata: Metadata = {
  // Name + role are structural (real); tagline is placeholder.
  title: "Abelito Visese — AI/ML Engineer",
  // TODO_ABELITO: replace with a real one-line description for SEO / social.
  description: "Portfolio of Abelito Visese. Ask the orchestrator what you want to see.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Fixed-viewport shell: the nav stays put and each view scrolls inside
          <main>, so the chat composer (docked at the bottom of the home view)
          is always reachable without scrolling the page. */}
      <body className="flex h-dvh flex-col overflow-hidden">
        <SiteNav />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Newsreader, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";
import { ChatProvider } from "@/components/chat/context";

// Editorial voice — headlines, standfirsts, pull-quotes, lessons. This is what
// makes the site read as a publication rather than a SaaS page.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

// UI and body copy.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Labels, metadata, code, all-caps eyebrows.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abelitovisese.com"),
  title: {
    default: "Abelito Visese — AI Engineer",
    template: "%s — Abelito Visese",
  },
  description:
    "AI Engineer at Datasaur. Retrieval systems, agent tooling and computer-vision pipelines — read the work, or ask the chat anything about it.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ChatProvider>
          <Shell>{children}</Shell>
        </ChatProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Newsreader, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { docCount } from "@/content/corpus";
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

const DESCRIPTION =
  "AI Engineer at Datasaur. Retrieval systems, agent tooling and computer-vision pipelines — read the work, or ask the chat anything about it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Abelito Visese — AI Engineer",
    template: "%s — Abelito Visese",
  },
  description: DESCRIPTION,
  // The og:image itself comes from app/opengraph-image.png by file convention.
  // X reads og:image when twitter:image is absent, so one card covers both.
  openGraph: {
    type: "website",
    siteName: "Abelito Visese",
    title: "Abelito Visese — AI Engineer",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abelito Visese — AI Engineer",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ChatProvider>
          <Shell docCount={docCount}>{children}</Shell>
        </ChatProvider>
      </body>
    </html>
  );
}

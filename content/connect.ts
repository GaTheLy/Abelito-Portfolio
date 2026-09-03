export interface ContactRow {
  key: string;
  value: string;
  tag: string;
  href?: string;
}

export const contacts: ContactRow[] = [
  { key: "EMAIL", value: "afvisese@gmail.com", tag: "FASTEST", href: "mailto:afvisese@gmail.com" },
  {
    key: "LINKEDIN",
    value: "linkedin.com/in/abelito",
    tag: "RECRUITERS",
    href: "https://linkedin.com/in/abelito",
  },
  { key: "GITHUB", value: "github.com/GaTheLy", tag: "CODE", href: "https://github.com/GaTheLy" },
  {
    key: "TIKTOK",
    value: "@abelitovisese",
    tag: "THE CHANNEL",
    href: "https://tiktok.com/@abelitovisese",
  },
  { key: "PHONE", value: "+62 812-1601-7057", tag: "WHATSAPP", href: "https://wa.me/6281216017057" },
  { key: "BASED", value: "Malang, East Java, Indonesia", tag: "GMT+7" },
];

/** Drop the PDF at this path in public/ and the download button goes live.
 *  Until then the button renders disabled with an honest label. */
export const RESUME_PATH = "/Resume_Abelito_AIML_June_2026.pdf";
export const RESUME_AVAILABLE = true;

export const sendMe = [
  {
    title: "If you're hiring",
    body: "The system you need built and who owns it today. I'll tell you honestly whether I'm the right level for it.",
  },
  {
    title: "If it's contract work",
    body: "The scope and the deadline. I'll send a figure back the same day rather than making you guess at a rate card.",
  },
];

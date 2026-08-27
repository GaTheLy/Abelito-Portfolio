import { roles, education } from "./work.ts";

// Home-page content. The route rail is DERIVED from content/work.ts rather than
// retyped — one list, one source, so a change to the work history updates the
// home page for free.

export const BYLINE = ["Abelito Faleyrio Visese", "AI Engineer at Datasaur · Malang, ID"];

export const HEADLINE = "I build the system around the model.";

export const STANDFIRST =
  "Retrieval that stays honest, agent loops that log what they cost, and the unglamorous state machines that make either one survive a real user. Nine shipped systems — ask the chat about any of them.";

/** Two lines each, so the labels break where the design breaks them. */
export const proof = [
  { value: "97.4%", label: "congestion classifier,\n14.4ms inference" },
  { value: "<2s", label: "phoneme-level scoring\non streaming audio" },
  { value: "~80%", label: "admin work cut\nfor a paying client" },
  { value: "0", label: "critical findings,\n3rd-party pen test" },
];

export interface RouteRow {
  date: string;
  org: string;
  what: string;
  current?: boolean;
}

/** Latest first — the rail reads as "where I am now, and how I got here". */
export const routeRows: RouteRow[] = [
  ...roles.map((role) => ({
    date: role.shortDate,
    // The rail names the AWS partnership; /work carries it as a side note.
    org: role.company === "Axrail" ? "Axrail · AWS" : role.company,
    what: role.oneLine,
    current: role.current,
  })),
  {
    date: education[0].shortDate,
    org: "Petra Christian University",
    what: "CS, Data Science.",
  },
];

/** The shorthand a recruiter scans for. Deliberately not a skills matrix. */
export const skills = ["RAG", "Agents · MCP", "Evals", "Computer vision", "AWS"];

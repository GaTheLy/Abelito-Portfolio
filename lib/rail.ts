import type { TopicId } from "../content/answers.ts";

/** What the 340px rail shows on a case study: that page's own outline, three
 *  questions written for that project, and two related builds. Derived from the
 *  case-study record so the outline can never drift from the page. */
export interface RailContext {
  title: string;
  /** Section labels, in page order. */
  sections: string[];
  questions: { label: string; topic: TopicId }[];
  related: { label: string; note: string; href: string }[];
}

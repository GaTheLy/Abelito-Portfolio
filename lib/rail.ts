/** What the 340px rail needs beside a case study — which is now only the scope.
 *  The section outline moved into the page's own left column, and the rail's
 *  question chips and related links are gone: the ask bar does the talking. */
export interface RailContext {
  /** Bounds every question asked from this page — see the `scope` arm of
   *  app/api/ask/route.ts. */
  slug: string;
  /** Short name, for the header and the input's placeholder. */
  name: string;
}

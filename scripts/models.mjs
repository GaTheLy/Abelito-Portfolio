// Prints the model ids the AI Gateway currently offers, so the slug in
// AI_MODEL is confirmed rather than guessed — gateway ids use dotted versions
// ("anthropic/claude-sonnet-4.6") and the catalogue changes.
//
//   npm run models              all Anthropic models
//   npm run models -- openai    filter by provider or name
//
// Needs a credential: run `vercel env pull .env.local` first, or export
// AI_GATEWAY_API_KEY.

import { gateway } from "ai";

const filter = (process.argv[2] ?? "anthropic").toLowerCase();

if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
  console.error(
    "No gateway credential found.\n" +
      "  vercel link && vercel env pull .env.local   (provisions VERCEL_OIDC_TOKEN)\n" +
      "  …or export AI_GATEWAY_API_KEY=…",
  );
  process.exit(1);
}

const { models } = await gateway.getAvailableModels();

const matches = models.filter((m) => m.id.toLowerCase().includes(filter));

if (matches.length === 0) {
  console.log(`No models matching "${filter}". Try: npm run models -- ""`);
} else {
  for (const model of matches) {
    console.log(model.id.padEnd(44), model.name ?? "");
  }
  console.log(`\n${matches.length} match(es). Set the one you want as AI_MODEL.`);
}

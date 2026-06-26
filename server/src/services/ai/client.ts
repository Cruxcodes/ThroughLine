import Anthropic from "@anthropic-ai/sdk";
import { config } from "../../config";

/**
 * LLM transports. Both take (system, user) and return the raw text reply.
 *
 * `claudeChat` is the active backend for every call in this service.
 * `glmChat` is kept as the restore path — each call site in `./index.ts` has
 * its original glmChat invocation commented out directly above the Claude one.
 */

// Standard key -> general endpoint. If using the sk-sp- CODING key, switch base to:
//   https://api.z.ai/api/coding/paas/v4/chat/completions
const GLM_URL = config.glm.baseUrl;
const GLM_MODEL = config.glm.model;

export async function glmChat(system: string, user: string): Promise<string> {
  const res = await fetch(GLM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.glm.apiKey}`,
    },
    body: JSON.stringify({
      model: GLM_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`GLM ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content;
}

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

export async function claudeChat(
  system: string,
  user: string,
): Promise<string> {
  const m = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: user }],
  });
  return m.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
}

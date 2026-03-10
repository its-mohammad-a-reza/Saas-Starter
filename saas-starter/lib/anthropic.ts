// lib/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export function buildSystemPrompt(org: {
  botName: string;
  botTone: string;
  systemPrompt?: string | null;
  knowledgeBase?: string | null;
}) {
  return (
    org.systemPrompt ??
    `You are ${org.botName}, a ${org.botTone} customer support agent.
${org.knowledgeBase ? `\nKnowledge base:\n${org.knowledgeBase}` : ""}
Rules:
- Be concise and solution-focused
- Respond in plain text only — no markdown or bullet points
- If you cannot resolve an issue after 2 turns, offer to escalate to a human agent
- Never make up information not in the knowledge base
- If the user asks to talk to a human, say: "I'll connect you with a human agent right away."`
  );
}

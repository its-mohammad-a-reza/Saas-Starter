// app/api/chat/route.ts
import { prisma } from "@/lib/db";
import { anthropic, buildSystemPrompt } from "@/lib/anthropic";

export async function POST(req: Request) {
  try {
    const { conversationId, content, visitorId, orgApiKey } = await req.json();

    if (!content || !orgApiKey) {
      return new Response("Missing content or orgApiKey", { status: 400 });
    }

    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: { keyHash: orgApiKey },
      include: { organization: true },
    });

    if (!apiKeyRecord) return new Response("Unauthorized", { status: 401 });

    const org = apiKeyRecord.organization;

    if (org.monthlyTokenUsage >= org.tokenLimit) {
      return new Response("Token limit reached", { status: 429 });
    }

    let conversation = conversationId
      ? await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
        })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { organizationId: org.id, visitorId: visitorId ?? null, status: "OPEN", channel: "WIDGET" },
        include: { messages: true },
      });
    }

    await prisma.message.create({
      data: { conversationId: conversation.id, role: "USER", content },
    });

    const history = [
      ...conversation.messages
        .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
        .map((m) => ({ role: m.role === "USER" ? "user" : "assistant" as const, content: m.content })),
      { role: "user" as const, content },
    ];

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: buildSystemPrompt(org),
      messages: history,
    });

    let fullText = "";
    let inputTokens = 0;
    let outputTokens = 0;

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              fullText += chunk.delta.text;
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
            if (chunk.type === "message_start") inputTokens = chunk.message.usage.input_tokens;
            if (chunk.type === "message_delta") outputTokens = chunk.usage.output_tokens;
          }
        } finally {
          controller.close();
          await Promise.all([
            prisma.message.create({
              data: { conversationId: conversation!.id, role: "ASSISTANT", content: fullText, inputTokens, outputTokens },
            }),
            prisma.organization.update({
              where: { id: org.id },
              data: { monthlyTokenUsage: { increment: inputTokens + outputTokens } },
            }),
            fullText.toLowerCase().includes("connect you with a human agent")
              ? prisma.conversation.update({ where: { id: conversation!.id }, data: { status: "ESCALATED" } })
              : Promise.resolve(),
          ]);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return new Response("Internal server error", { status: 500 });
  }
}

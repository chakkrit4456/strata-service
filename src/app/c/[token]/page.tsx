import { notFound } from "next/navigation";
import { getByToken, getMessages, getRequirement, requirementOf } from "@/lib/conversations";
import { ChatClient } from "./ChatClient";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const conv = await getByToken(token);
  if (!conv) notFound();
  const msgs = (await getMessages(conv.id)).filter((m) => m.role !== "system");
  return (
    <ChatClient
      token={token}
      code={conv.code}
      source={conv.source}
      status={conv.status}
      initialMessages={msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt.toISOString() }))}
      initialRequirement={requirementOf(await getRequirement(conv.id))}
    />
  );
}

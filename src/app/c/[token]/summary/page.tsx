import { notFound } from "next/navigation";
import { getByToken, getRequirement, requirementOf } from "@/lib/conversations";
import { SummaryClient } from "./SummaryClient";

export const dynamic = "force-dynamic";

export default async function SummaryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const conv = await getByToken(token);
  if (!conv) notFound();
  const req = await getRequirement(conv.id);
  return (
    <SummaryClient
      token={token}
      code={conv.code}
      source={conv.source}
      createdAt={conv.createdAt.toISOString()}
      confirmedAt={req?.confirmedAt?.toISOString() ?? null}
      initial={requirementOf(req)}
    />
  );
}

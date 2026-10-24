export type ChatMessage = { id: number | string; role: string; content: string; createdAt?: string | Date };

const time = (d?: string | Date) =>
  d ? new Date(d).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" }) : "";

// perspective: "customer" = ลูกค้าอยู่ขวา, "admin" = ลูกค้าอยู่ขวาเช่นกันแต่ป้ายต่างกัน
export function Messages({
  messages,
  perspective = "customer",
  streamingId,
}: {
  messages: ChatMessage[];
  perspective?: "customer" | "admin";
  streamingId?: string | number | null;
}) {
  return (
    <>
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="anim-msg-in flex max-w-[560px] flex-col items-end gap-1 self-end">
            <div className="prose-chat rounded-[20px_20px_4px_20px] bg-ink-2 px-4 py-3 text-[15px] leading-relaxed text-white">
              {m.content}
            </div>
            <span className="font-mono text-[11px] text-stone-2">
              {perspective === "admin" ? "ลูกค้า · " : ""}
              {time(m.createdAt)}
            </span>
          </div>
        ) : (
          <div key={m.id} className="anim-msg-in flex max-w-[640px] gap-3">
            {m.role === "admin" ? (
              <span className="flex size-7 flex-none items-center justify-center rounded-full bg-ink-2 text-[10px] font-semibold text-white">S</span>
            ) : (
              <span className={`orb size-7 flex-none ${m.id === streamingId ? "anim-pulse-dot" : ""}`} />
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[12px] font-medium text-muted">
                {m.role === "admin" ? "ทีม Strata" : perspective === "admin" ? "AI" : "Strata AI"} · {time(m.createdAt)}
              </span>
              <div className={`prose-chat text-[15px] leading-relaxed ${m.id === streamingId ? "caret" : ""}`}>{m.content}</div>
            </div>
          </div>
        ),
      )}
    </>
  );
}

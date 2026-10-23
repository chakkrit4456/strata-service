export type ChatMessage = { id: number | string; role: string; content: string; createdAt?: string | Date };

const time = (d?: string | Date) =>
  d ? new Date(d).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" }) : "";

// perspective: "customer" = ลูกค้าอยู่ขวา, "admin" = ลูกค้าอยู่ขวาเช่นกันแต่ป้ายต่างกัน
export function Messages({ messages, perspective = "customer" }: { messages: ChatMessage[]; perspective?: "customer" | "admin" }) {
  return (
    <>
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="flex max-w-[560px] flex-col items-end gap-1 self-end">
            <div className="prose-chat rounded-[12px_12px_2px_12px] bg-ink px-4 py-3 text-[15px] leading-relaxed text-cream">
              {m.content}
            </div>
            <span className="font-mono text-[11px] text-stone-2">
              {perspective === "admin" ? "ลูกค้า · " : ""}
              {time(m.createdAt)}
            </span>
          </div>
        ) : (
          <div key={m.id} className="flex max-w-[640px] gap-3">
            <span
              className={`flex size-7 flex-none items-center justify-center rounded-md ${m.role === "admin" ? "bg-gold" : "bg-ink"}`}
            >
              <span className={`size-2 ${m.role === "admin" ? "bg-ink" : "bg-gold"}`} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[11px] font-medium text-muted">
                {m.role === "admin" ? "ทีม Strata" : perspective === "admin" ? "AI" : "Strata AI"} · {time(m.createdAt)}
              </span>
              <div className="prose-chat text-[15px] leading-relaxed">{m.content}</div>
            </div>
          </div>
        ),
      )}
    </>
  );
}

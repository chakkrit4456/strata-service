"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Messages, type ChatMessage } from "@/components/Messages";
import { RequirementPanel } from "@/components/RequirementPanel";
import type { Requirement } from "@/lib/requirement";

type Props = {
  token: string;
  code: string;
  source: string;
  status: string;
  initialMessages: ChatMessage[];
  initialRequirement: Requirement;
};

export function ChatClient({ token, code, source, status: initialStatus, initialMessages, initialRequirement }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [requirement, setRequirement] = useState(initialRequirement);
  const [status, setStatus] = useState(initialStatus);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showReq, setShowReq] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const reload = useCallback(async () => {
    const res = await fetch(`/api/conversations/${token}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (busyRef.current) return;
    setMessages(data.messages);
    setRequirement(data.requirement);
    setStatus(data.status);
  }, [token]);

  const refreshRequirement = useCallback(async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/requirements/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) setRequirement((await res.json()).requirement);
    } finally {
      setUpdating(false);
    }
  }, [token]);

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setError("");
      setInput("");
      const now = new Date().toISOString();
      setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", content: msg, createdAt: now }]);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token, message: msg }),
        });
        if (res.status === 204) {
          // เจ้าของรับช่วงต่อ — รอคำตอบจากทีมผ่านการ poll
        } else if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "ส่งข้อความไม่สำเร็จ");
        } else {
          const id = `a${Date.now()}`;
          setMessages((m) => [...m, { id, role: "assistant", content: "", createdAt: new Date().toISOString() }]);
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let acc = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            acc += dec.decode(value, { stream: true });
            setMessages((m) => m.map((x) => (x.id === id ? { ...x, content: acc } : x)));
          }
          await refreshRequirement();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      } finally {
        busyRef.current = false;
        setBusy(false);
        reload();
      }
    },
    [token, refreshRequirement, reload],
  );

  // ข้อความแรกที่พิมพ์จากหน้าแรก
  useEffect(() => {
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(`strata:pending:${token}`);
      if (pending) sessionStorage.removeItem(`strata:pending:${token}`);
      localStorage.setItem("strata:last", token);
    } catch {}
    if (pending) send(pending);
  }, [token, send]);

  // รับข้อความจากทีม Strata เมื่อเจ้าของตอบเอง
  useEffect(() => {
    const t = setInterval(() => {
      if (!busyRef.current && document.visibilityState === "visible") reload();
    }, 8000);
    return () => clearInterval(t);
  }, [reload]);

  async function upload(file: File) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("token", token);
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      busyRef.current = false;
      setBusy(false);
      await reload();
    }
  }

  const confirmed = status !== "new" && status !== "chatting";

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-white px-4 py-3.5 md:px-7">
        <div className="flex items-center gap-3.5">
          <Link href="/" aria-label="หน้าแรก">
            <LogoMark size={28} />
          </Link>
          <span className="text-[15px] font-semibold">{requirement.title || "โปรเจกต์ใหม่"}</span>
          <span className="font-mono text-xs text-muted">#{code}</span>
          {source !== "direct" && (
            <span className="rounded bg-gold-soft px-2 py-0.5 font-mono text-[11px] font-medium text-gold-text">src={source}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <span className="hidden md:inline">บันทึกอัตโนมัติ · กลับมาคุยต่อได้ด้วยลิงก์นี้</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="rounded-md border border-sand-2 px-3.5 py-2 font-medium text-ink hover:bg-paper"
          >
            {copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}
          </button>
          <button
            onClick={() => setShowReq((v) => !v)}
            className="rounded-md bg-ink px-3.5 py-2 font-medium text-cream lg:hidden"
          >
            Requirement
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className={`flex min-h-0 flex-col ${showReq ? "hidden lg:flex" : ""}`}>
          <div ref={scroller} className="flex flex-1 flex-col gap-4.5 overflow-y-auto px-4 py-8 md:px-16">
            <Messages messages={messages} />
            {busy && messages.at(-1)?.role === "user" && (
              <div className="flex items-center gap-2 font-mono text-xs text-muted">
                <span className="size-2 animate-pulse bg-gold" /> Strata AI กำลังพิมพ์…
              </div>
            )}
          </div>
          <div className="px-4 pb-6 md:px-16">
            {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-3 rounded-xl border border-sand-2 bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(13,15,17,.04)]"
            >
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                aria-label="แนบไฟล์"
                className="flex size-8 flex-none items-center justify-center rounded-md border border-sand text-lg text-muted hover:bg-paper"
              >
                +
              </button>
              <input
                ref={fileInput}
                type="file"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="พิมพ์ข้อความ หรือแนบไฟล์ / รูป / ลิงก์ตัวอย่าง…"
                className="max-h-40 min-h-8 flex-1 resize-none bg-transparent py-1 text-[15px] outline-none placeholder:text-stone-2"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="ส่ง"
                className="flex size-9 flex-none items-center justify-center rounded-lg bg-ink font-semibold text-cream disabled:opacity-40"
              >
                ↑
              </button>
            </form>
            <p className="mt-2.5 text-center font-mono text-[11px] text-stone-2">
              AI อาจตอบผิดได้ ทีม Strata จะตรวจ Requirement อีกครั้งก่อนเสนอราคา
            </p>
          </div>
        </div>

        <div className={`min-h-0 border-l border-sand ${showReq ? "flex flex-col" : "hidden lg:flex lg:flex-col"}`}>
          <RequirementPanel
            requirement={requirement}
            updating={updating}
            footer={
              <Link
                href={`/c/${token}/summary`}
                className="flex-1 rounded-lg bg-ink p-3 text-center text-sm font-semibold text-cream hover:bg-ink-2"
              >
                {confirmed ? "ดูสรุปที่ส่งแล้ว" : "ดูสรุปและยืนยัน"}
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatbotApi } from "@/lib/api";
import type { ChatbotMessage, ChatbotSession, ChatbotSessionSummary } from "@/api/chatbot";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Loader2,
  X,
  ChevronLeft,
  History,
  Sparkles,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ChatbotMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2 items-end", isUser ? "flex-row-reverse" : "")}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mb-0.5">
          <Bot className="w-3 h-3 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-primary text-on-primary rounded-br-sm"
            : "bg-surface-container-highest text-on-surface rounded-bl-sm"
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mb-0.5">
        <Bot className="w-3 h-3 text-primary" />
      </div>
      <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-surface-container-highest flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AiChatBubble() {
  const domainId = useAuthStore((s) => s.selectedDomainId);
  const qc = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Sessions list (for history panel) ──────────────────────────────────────
  const { data: sessions = [] } = useQuery({
    queryKey: ["chatbot-sessions", domainId],
    queryFn: () => chatbotApi.sessions(domainId!),
    enabled: !!domainId && isOpen,
  });

  // ── Load a session ──────────────────────────────────────────────────────────
  const loadSession = async (id: number) => {
    if (!domainId) return;
    setShowHistory(false);
    setActiveSessionId(id);
    setMessages([]);
    const session: ChatbotSession = await chatbotApi.showSession(domainId, id);
    setMessages(session.messages ?? []);
  };

  // ── Start new session ───────────────────────────────────────────────────────
  const startMutation = useMutation({
    mutationFn: () => chatbotApi.startSession(domainId!),
    onSuccess: (session: ChatbotSession) => {
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
      setActiveSessionId(session.id);
      setMessages([]);
      setShowHistory(false);
    },
  });

  // ── Delete session ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: number) => chatbotApi.deleteSession(domainId!, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
      }
    },
  });

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      // If no active session, start one first
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session: ChatbotSession = await chatbotApi.startSession(domainId!);
        qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
        setActiveSessionId(session.id);
        sessionId = session.id;
      }
      const userMsg: ChatbotMessage = {
        id: Date.now(),
        role: "user",
        content: text,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      return chatbotApi.sendMessage(domainId!, sessionId, text);
    },
    onSuccess: (reply: ChatbotMessage) => {
      setIsTyping(false);
      setMessages((prev) => [...prev, reply]);
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
    },
    onError: () => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          tokens_used: 0,
          created_at: new Date().toISOString(),
        },
      ]);
    },
  });

  // ── Input handlers ──────────────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !domainId || sendMutation.isPending) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMutation.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render anything if no domain is selected
  if (!domainId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            "w-[360px] flex flex-col rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden",
            "bg-surface",
            "transition-all duration-200 origin-bottom-right",
            "animate-in fade-in zoom-in-95"
          )}
          style={{ height: 520 }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-primary text-on-primary flex-shrink-0">
            {showHistory ? (
              <button
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                onClick={() => setShowHistory(false)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none">
                {showHistory ? "Chat History" : "AI Assistant"}
              </p>
              {!showHistory && (
                <p className="text-[10px] opacity-70 mt-0.5">Ask anything about your analytics</p>
              )}
            </div>

            {!showHistory && (
              <>
                <button
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="History"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="New chat"
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                >
                  {startMutation.isPending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Plus className="w-3.5 h-3.5" />}
                </button>
              </>
            )}

            <button
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── History panel ──────────────────────────────────────────── */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="p-3 space-y-0.5">
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary/8 hover:bg-primary/15 text-primary transition-colors text-left"
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                >
                  {startMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    : <Plus className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-sm font-semibold">New Chat</span>
                </button>

                <div className="mt-3 mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
                  Recent
                </div>

                {(sessions as ChatbotSessionSummary[]).length === 0 && (
                  <p className="text-xs text-on-surface-variant/50 text-center py-4">No chats yet</p>
                )}

                {(sessions as ChatbotSessionSummary[]).map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                      activeSessionId === s.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-surface-container text-on-surface-variant"
                    )}
                    onClick={() => loadSession(s.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{s.title || "New chat"}</p>
                      <p className="text-[10px] opacity-60">{fmtDate(s.updated_at)}</p>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-error/10 hover:text-error transition-all flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(s.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ── Messages ──────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
                {messages.length === 0 && !isTyping && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface mb-1">Ask me anything</p>
                      <p className="text-xs text-on-surface-variant/70 max-w-[220px] leading-relaxed">
                        I have access to your real analytics data for this site.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      {[
                        "What are my top pages?",
                        "Why is my bounce rate high?",
                        "Which country sends most traffic?",
                      ].map((q) => (
                        <button
                          key={q}
                          className="text-left px-3 py-2 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant hover:bg-surface-container hover:border-primary/30 hover:text-on-surface transition-all"
                          onClick={() => sendMutation.mutate(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <Bubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* ── Input ─────────────────────────────────────────────── */}
              <div className="px-3 pb-3 pt-2 border-t border-outline-variant/15 flex-shrink-0">
                <div className="flex items-end gap-2 bg-surface-container rounded-2xl px-3 py-2">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your analytics…"
                    className="flex-1 resize-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none min-h-[22px] max-h-[100px] leading-[22px]"
                    disabled={sendMutation.isPending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sendMutation.isPending}
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      input.trim() && !sendMutation.isPending
                        ? "bg-primary text-on-primary hover:bg-primary/90 active:scale-95"
                        : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"
                    )}
                  >
                    {sendMutation.isPending
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Toggle bubble button ────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95",
          isOpen
            ? "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest"
            : "bg-primary text-on-primary hover:bg-primary/90 shadow-primary/30"
        )}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Bot className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}

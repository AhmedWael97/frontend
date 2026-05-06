"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { chatbotApi } from "@/lib/api";
import type { ChatbotMessage, ChatbotSession, ChatbotSessionSummary } from "@/api/chatbot";
import { useAuthStore } from "@/store/auth";
import {
  Bot,
  Plus,
  Send,
  Trash2,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ChatbotMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 max-w-3xl", isUser ? "ml-auto flex-row-reverse" : "")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
          isUser ? "bg-primary/20" : "bg-secondary/20"
        )}
      >
        {isUser ? (
          <span className="text-xs font-bold text-primary">You</span>
        ) : (
          <Bot className="w-4 h-4 text-secondary" />
        )}
      </div>
      {/* Content */}
      <div
        className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-on-primary rounded-tr-sm"
            : "bg-surface-container text-on-surface rounded-tl-sm"
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-3xl">
      <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="w-4 h-4 text-secondary" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-container flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const domainId = useAuthStore((s) => s.selectedDomainId);
  const qc = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Sidebar: session list ─────────────────────────────────────────────────

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["chatbot-sessions", domainId],
    queryFn: () => chatbotApi.sessions(domainId!),
    enabled: !!domainId,
  });

  // ── Load a session ────────────────────────────────────────────────────────

  const loadSession = useCallback(
    async (id: number) => {
      if (!domainId) return;
      setActiveSessionId(id);
      setMessages([]);
      const session: ChatbotSession = await chatbotApi.showSession(domainId, id);
      setMessages(session.messages ?? []);
    },
    [domainId]
  );

  // ── New session ───────────────────────────────────────────────────────────

  const startMutation = useMutation({
    mutationFn: () => chatbotApi.startSession(domainId!),
    onSuccess: (session: ChatbotSession) => {
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
      setActiveSessionId(session.id);
      setMessages([]);
    },
  });

  // ── Delete session ────────────────────────────────────────────────────────

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

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      // Optimistically add user message
      const userMsg: ChatbotMessage = {
        id: Date.now(),
        role: "user",
        content: text,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      const reply = await chatbotApi.sendMessage(domainId!, activeSessionId!, text);
      return reply;
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

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !activeSessionId || sendMutation.isPending) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendMutation.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Empty state (no domain selected) ─────────────────────────────────────

  if (!domainId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">Select a website first</h2>
        <p className="text-on-surface-variant text-sm max-w-xs">
          Choose a domain from the top bar to start chatting with your AI analytics assistant.
        </p>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-outline-variant/20 bg-surface-container-lowest">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/20">
          <h1 className="text-base font-black text-on-surface tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Assistant
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Ask anything about your analytics</p>
        </div>

        {/* New chat button */}
        <div className="p-3 border-b border-outline-variant/10">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
          >
            {startMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Chat
          </Button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 no-scrollbar">
          {loadingSessions && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant/50" />
            </div>
          )}
          {!loadingSessions && sessions.length === 0 && (
            <div className="px-4 py-6 text-center">
              <MessageSquare className="w-6 h-6 text-on-surface-variant/30 mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant/60">No chats yet</p>
            </div>
          )}
          {(sessions as ChatbotSessionSummary[]).map((s) => (
            <div
              key={s.id}
              className={cn(
                "group mx-2 px-3 py-2.5 rounded-lg cursor-pointer flex items-start justify-between gap-2 transition-all",
                activeSessionId === s.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface-container text-on-surface-variant"
              )}
              onClick={() => loadSession(s.id)}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">
                  {s.title || "New chat"}
                </p>
                <p className="text-[10px] opacity-60 mt-0.5">{fmtDate(s.updated_at)}</p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error/10 hover:text-error transition-all flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(s.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeSessionId === null ? (
          /* Welcome screen */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Your AI Analytics Assistant
              </h2>
              <p className="text-sm text-on-surface-variant max-w-sm">
                Ask questions about your traffic, top pages, visitor trends, or get actionable growth ideas — powered by your real data.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                "What are my top pages this month?",
                "Why is my bounce rate high?",
                "Which countries send the most traffic?",
                "How can I improve visitor retention?",
              ].map((q) => (
                <button
                  key={q}
                  className="text-left px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container/50 hover:bg-surface-container hover:border-primary/30 text-xs text-on-surface-variant hover:text-on-surface transition-all"
                  onClick={async () => {
                    const session: ChatbotSession = await chatbotApi.startSession(domainId!);
                    qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
                    setActiveSessionId(session.id);
                    setMessages([]);
                    sendMutation.mutate(q);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-on-surface-variant/50">
              Click a suggestion or start a new chat to begin
            </p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar">
              {messages.length === 0 && !isTyping && (
                <div className="text-center text-xs text-on-surface-variant/50 py-8">
                  Session started — ask your first question below
                </div>
              )}
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-4 pb-4 pt-3 border-t border-outline-variant/20">
              <div className="flex items-end gap-3 bg-surface-container rounded-2xl px-4 py-3">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your analytics…"
                  className="flex-1 resize-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none min-h-[24px] max-h-[140px] leading-6"
                  disabled={sendMutation.isPending}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMutation.isPending}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                    input.trim() && !sendMutation.isPending
                      ? "bg-primary text-on-primary hover:bg-primary/90 active:scale-95"
                      : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"
                  )}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant/40 text-center mt-2">
                Shift+Enter for new line · Enter to send
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotApi } from "@/lib/api";
import type { ChatbotMessage, ChatbotSession, ChatbotSessionSummary } from "@/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatbotMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/30"
        )}
      >
        {msg.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-3 flex-shrink-0 mt-1">
          <span className="text-xs font-semibold text-primary">You</span>
        </div>
      )}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-surface-container rounded-2xl rounded-tl-sm border border-outline-variant/30 px-4 py-3">
        <span className="flex gap-1 items-center">
          <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}

// ── Session list item ─────────────────────────────────────────────────────────

function SessionItem({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: ChatbotSessionSummary;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{session.title}</p>
        <p className="text-xs text-on-surface-variant/60 mt-0.5">
          {session.messages_count} messages ·{" "}
          {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="ml-2 opacity-0 group-hover:opacity-100 p-1 rounded text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onNew, loading }: { onNew: () => void; loading: boolean }) {
  const prompts = [
    "What's driving my bounce rate this month?",
    "Which pages need the most improvement?",
    "Where are my visitors coming from?",
    "How does mobile traffic compare to desktop?",
    "What are my top performing pages?",
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-2">AI Analytics Assistant</h3>
      <p className="text-sm text-on-surface-variant mb-8 max-w-sm">
        Ask questions about your website analytics. Your AI assistant has access to
        real-time data from the last 30 days.
      </p>
      <div className="w-full max-w-sm space-y-2 mb-8">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={onNew}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-surface-container text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center gap-2"
          >
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            {p}
          </button>
        ))}
      </div>
      <Button onClick={onNew} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Start a new chat
      </Button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AiChatbotPage() {
  const domainId = useAuthStore((s) => s.selectedDomainId);
  const qc = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch session list ──────────────────────────────────────────────────────
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["chatbot-sessions", domainId],
    queryFn: () => chatbotApi.sessions(domainId!),
    enabled: !!domainId,
    select: (r) => r.data as ChatbotSessionSummary[],
  });

  // ── Start new session ───────────────────────────────────────────────────────
  const startSession = useMutation({
    mutationFn: () => chatbotApi.startSession(domainId!),
    onSuccess: (r) => {
      const session = r.data as ChatbotSession;
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
      setActiveSessionId(session.id);
      setMessages(session.messages ?? []);
    },
  });

  // ── Load existing session ───────────────────────────────────────────────────
  const loadSession = useCallback(
    async (sessionId: number) => {
      if (!domainId) return;
      const r = await chatbotApi.showSession(domainId, sessionId);
      const session = r.data as ChatbotSession;
      setActiveSessionId(session.id);
      setMessages(session.messages ?? []);
    },
    [domainId]
  );

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: number; message: string }) =>
      chatbotApi.sendMessage(domainId!, sessionId, message),
    onMutate: ({ message }) => {
      const optimistic: ChatbotMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setIsTyping(true);
    },
    onSuccess: (r) => {
      const reply = r.data as ChatbotMessage;
      setMessages((prev) => [...prev, reply]);
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
    },
    onSettled: () => setIsTyping(false),
  });

  // ── Delete session ──────────────────────────────────────────────────────────
  const deleteSession = useMutation({
    mutationFn: (sessionId: number) => chatbotApi.deleteSession(domainId!, sessionId),
    onSuccess: (_, sessionId) => {
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    },
  });

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !domainId || sendMessage.isPending) return;

    setInput("");

    let sessionId = activeSessionId;
    if (!sessionId) {
      const r = await chatbotApi.startSession(domainId);
      const session = r.data as ChatbotSession;
      qc.invalidateQueries({ queryKey: ["chatbot-sessions", domainId] });
      sessionId = session.id;
      setActiveSessionId(session.id);
    }

    sendMessage.mutate({ sessionId, message: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!domainId) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-on-surface-variant">
        Select a website to start chatting with your AI assistant.
      </div>
    );
  }

  const showEmpty = !activeSessionId && messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-outline-variant/20 bg-surface-container-low">
        <div className="p-4 border-b border-outline-variant/20">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => startSession.mutate()}
            disabled={startSession.isPending}
          >
            {startSession.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-3">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-on-surface-variant/50 text-center py-6 px-3">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-1">
              {sessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  active={s.id === activeSessionId}
                  onSelect={() => loadSession(s.id)}
                  onDelete={() => deleteSession.mutate(s.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-xs text-on-surface-variant/60">Powered by GPT-4o</span>
          </div>
        </div>
      </aside>

      {/* ── Chat area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-background flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-on-surface">AI Analytics Assistant</h1>
            <p className="text-xs text-on-surface-variant/60">
              Ask anything about your website data
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {showEmpty ? (
            <EmptyState
              onNew={() => startSession.mutate()}
              loading={startSession.isPending}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-background">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your analytics… (Enter to send, Shift+Enter for newline)"
              className="flex-1 min-h-[48px] max-h-32 resize-none text-sm"
              rows={1}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className="flex-shrink-0 h-12 w-12"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-center text-on-surface-variant/40 mt-2">
            Analysis is based on the last 30 days of data for your selected domain.
          </p>
        </div>
      </div>
    </div>
  );
}

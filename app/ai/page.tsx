"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  Trash2,
  BookOpen,
  Code2,
  Brain,
  Lightbulb,
  Plus,
  Pin,
  PinOff,
  MoreVertical,
  Edit2,
  Clock,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  X,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  isPinned: boolean;
  messages: Message[];
  updatedAt: string;
}

const STORAGE_KEY = "devos_ai_chats_v1";

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your **DevOS AI Study & Coding Assistant**. I can help you with programming questions, explain CS concepts (DSA, DBMS, OS, Networks), debug code, and guide you through your daily DevOS learning tasks.\n\nHow can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const QUICK_PROMPTS = [
  { label: "What should I study today?", icon: BookOpen, prompt: "What should I study today based on my DevOS schedule and revisions?" },
  { label: "Explain today's revision", icon: Brain, prompt: "Can you summarize and explain the key concepts for the topics I need to revise today?" },
  { label: "Give me a DSA problem", icon: Code2, prompt: "Give me a medium Data Structures & Algorithms problem in Java/C++ with test cases and hints." },
  { label: "Create a study plan", icon: Lightbulb, prompt: "Help me create an effective 7-day revision schedule for Computer Science core subjects." },
  { label: "Explain Time & Space Complexity", icon: Sparkles, prompt: "Explain how to calculate Time and Space complexity for recursive algorithms with examples." },
  { label: "Help debug my code", icon: Code2, prompt: "Here is a code snippet I am working on. Can you find potential bugs and suggest optimizations?" },
];

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Rename modal / inline editing state
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Message edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // 1. Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ChatConversation[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          // Set latest conversation as active by default
          const sorted = [...parsed].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          const latest = sorted[0];
          setActiveChatId(latest.id);
          setMessages(latest.messages.length > 0 ? latest.messages : [DEFAULT_WELCOME_MESSAGE]);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load chat conversations from localStorage:", e);
    }
  }, []);

  // 2. Save conversations to localStorage
  function saveConversationsToStorage(updated: ChatConversation[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save chat conversations to localStorage:", e);
    }
  }

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus rename input
  useEffect(() => {
    if (editingChatId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [editingChatId]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside() {
      if (activeMenuId) setActiveMenuId(null);
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  // Split Pinned and Recent conversations
  const pinnedConversations = useMemo(() => {
    return conversations
      .filter((c) => c.isPinned)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [conversations]);

  const recentConversations = useMemo(() => {
    return conversations
      .filter((c) => !c.isPinned)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 20);
  }, [conversations]);

  // Create a new conversation
  function handleNewChat() {
    setActiveChatId(null);
    setMessages([
      {
        ...DEFAULT_WELCOME_MESSAGE,
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
    setMobileDrawerOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // Switch to an existing conversation
  function handleSelectChat(chat: ChatConversation) {
    setActiveChatId(chat.id);
    setMessages(chat.messages.length > 0 ? chat.messages : [DEFAULT_WELCOME_MESSAGE]);
    setMobileDrawerOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // Toggle pin status
  function handleTogglePin(chatId: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    setActiveMenuId(null);
    const updated = conversations.map((c) =>
      c.id === chatId ? { ...c, isPinned: !c.isPinned, updatedAt: new Date().toISOString() } : c,
    );
    setConversations(updated);
    saveConversationsToStorage(updated);
  }

  // Start renaming
  function handleStartRename(chat: ChatConversation, e?: React.MouseEvent) {
    e?.stopPropagation();
    setActiveMenuId(null);
    setEditingChatId(chat.id);
    setRenameValue(chat.title);
  }

  // Save renamed conversation
  function handleSaveRename(chatId: string) {
    const trimmed = renameValue.trim();
    if (trimmed) {
      const updated = conversations.map((c) =>
        c.id === chatId ? { ...c, title: trimmed } : c,
      );
      setConversations(updated);
      saveConversationsToStorage(updated);
    }
    setEditingChatId(null);
  }

  // Delete conversation
  function handleDeleteChat(chatId: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    setActiveMenuId(null);
    const updated = conversations.filter((c) => c.id !== chatId);
    setConversations(updated);
    saveConversationsToStorage(updated);

    if (activeChatId === chatId) {
      if (updated.length > 0) {
        const sorted = [...updated].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        handleSelectChat(sorted[0]);
      } else {
        handleNewChat();
      }
    }
  }

  // Send message
  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let currentId = activeChatId;
    let updatedList = [...conversations];

    // If starting a fresh chat session, create and name the conversation based on the first prompt
    if (!currentId) {
      currentId = crypto.randomUUID();
      setActiveChatId(currentId);

      const title = text.length > 32 ? text.slice(0, 32) + "…" : text;
      const newConv: ChatConversation = {
        id: currentId,
        title,
        isPinned: false,
        messages: newMessages,
        updatedAt: new Date().toISOString(),
      };
      updatedList = [newConv, ...conversations];
      setConversations(updatedList);
      saveConversationsToStorage(updatedList);
    }

    try {
      const history = newMessages
        .filter((m) => m.id !== "welcome")
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await api.ai.chat(text, history);

      let assistantMessage: Message;
      if (res.data?.response) {
        assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.data.response,
          intent: res.data.intent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            res.error ||
            "I'm sorry, I encountered an issue generating a response. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Persist to conversation history
      const nowIso = new Date().toISOString();
      const updatedWithResponse = updatedList.map((c) =>
        c.id === currentId ? { ...c, messages: finalMessages, updatedAt: nowIso } : c,
      );
      setConversations(updatedWithResponse);
      saveConversationsToStorage(updatedWithResponse);
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Network error. Please verify your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleStartEdit(message: Message) {
    if (loading) return;
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setEditingContent("");
  }

  async function handleSaveEdit(messageId: string) {
    const trimmed = editingContent.trim();
    if (!trimmed || loading) return;

    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const updatedUserMessage: Message = {
      ...messages[msgIndex],
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Keep all conversation turns prior to this message, then add the edited message
    const priorMessages = messages.slice(0, msgIndex);
    const newMessages = [...priorMessages, updatedUserMessage];
    setMessages(newMessages);
    setEditingMessageId(null);
    setEditingContent("");
    setLoading(true);

    const currentId = activeChatId;
    const updatedList = [...conversations];

    try {
      const history = priorMessages
        .filter((m) => m.id !== "welcome")
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await api.ai.chat(trimmed, history);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          res.data?.response ||
          res.error ||
          "I'm sorry, I encountered an issue generating a response. Please try again.",
        intent: res.data?.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      if (currentId) {
        const nowIso = new Date().toISOString();
        const updatedWithResponse = updatedList.map((c) =>
          c.id === currentId ? { ...c, messages: finalMessages, updatedAt: nowIso } : c,
        );
        setConversations(updatedWithResponse);
        saveConversationsToStorage(updatedWithResponse);
      }
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Network error. Please verify your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function handleRegenerate(assistantMessageId: string) {
    if (loading) return;

    const astIndex = messages.findIndex((m) => m.id === assistantMessageId);
    if (astIndex <= 0) return;

    // Find the user prompt preceding this assistant message
    let userMsgIndex = -1;
    for (let i = astIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMsgIndex = i;
        break;
      }
    }
    if (userMsgIndex === -1) return;

    const userPrompt = messages[userMsgIndex].content;
    // Replace everything starting from this assistant message
    const priorMessages = messages.slice(0, userMsgIndex + 1);
    setMessages(priorMessages);
    setLoading(true);

    const currentId = activeChatId;
    const updatedList = [...conversations];

    try {
      const history = messages
        .slice(0, userMsgIndex)
        .filter((m) => m.id !== "welcome")
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await api.ai.chat(userPrompt, history);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          res.data?.response ||
          res.error ||
          "I'm sorry, I encountered an issue generating a response. Please try again.",
        intent: res.data?.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalMessages = [...priorMessages, assistantMessage];
      setMessages(finalMessages);

      if (currentId) {
        const nowIso = new Date().toISOString();
        const updatedWithResponse = updatedList.map((c) =>
          c.id === currentId ? { ...c, messages: finalMessages, updatedAt: nowIso } : c,
        );
        setConversations(updatedWithResponse);
        saveConversationsToStorage(updatedWithResponse);
      }
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Network error. Please verify your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...priorMessages, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function clearChat() {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Chat cleared. What topic or problem would you like to work on next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    if (activeChatId) {
      const updated = conversations.map((c) =>
        c.id === activeChatId ? { ...c, messages: [] } : c,
      );
      setConversations(updated);
      saveConversationsToStorage(updated);
    }
  }

  // Render formatted markdown with code block copy buttons
  function renderFormattedContent(content: string, msgId: string) {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {textBefore}
          </span>,
        );
      }

      const lang = match[1] || "code";
      const code = match[2];
      const codeId = `${msgId}-code-${blockCount++}`;

      parts.push(
        <div key={codeId} className="my-3 rounded-lg overflow-hidden border border-base-border/70 bg-[#090b10] max-w-full min-w-0">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#12151f] border-b border-base-border/40 text-[11px] font-mono text-ink-muted">
            <span>{lang}</span>
            <button
              onClick={() => handleCopy(code, codeId)}
              className="flex items-center gap-1 hover:text-ink transition-colors"
            >
              {copiedId === codeId ? (
                <>
                  <Check className="h-3 w-3 text-signal-high" />
                  <span className="text-signal-high">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-xs font-mono overflow-x-auto text-ink-base leading-relaxed scrollbar-thin">
            <code>{code}</code>
          </pre>
        </div>,
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      parts.push(
        <span key={`text-end`} className="whitespace-pre-wrap break-words">
          {remainingText}
        </span>,
      );
    }

    return parts;
  }

  // Render individual chat row with actions
  function renderConversationItem(chat: ChatConversation) {
    const isActive = activeChatId === chat.id;
    const isEditing = editingChatId === chat.id;

    if (isEditing) {
      return (
        <div
          key={chat.id}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-base-subtle border border-accent/40"
        >
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename(chat.id);
              if (e.key === "Escape") setEditingChatId(null);
            }}
            onBlur={() => handleSaveRename(chat.id)}
            className="flex-1 text-xs bg-transparent border-none outline-none text-ink font-medium"
          />
          <button
            onClick={() => handleSaveRename(chat.id)}
            className="p-1 text-accent hover:text-accent-strong"
          >
            <Check className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={chat.id}
        onClick={() => handleSelectChat(chat)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
          isActive
            ? "bg-accent/15 text-accent font-semibold border border-accent/25 shadow-sm"
            : "text-ink-muted hover:text-ink hover:bg-base-subtle/70"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-1">
          {chat.isPinned ? (
            <Pin className="h-3 w-3 text-accent shrink-0" />
          ) : (
            <MessageSquare className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
          )}
          <span className="truncate">{chat.title || "Untitled Chat"}</span>
        </div>

        {/* Action button & Dropdown menu */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => handleTogglePin(chat.id, e)}
            title={chat.isPinned ? "Unpin" : "Pin"}
            className="p-1 hover:text-accent rounded transition-colors text-ink-muted"
          >
            {chat.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
              }}
              title="More options"
              className="p-1 hover:text-ink rounded transition-colors text-ink-muted"
            >
              <MoreVertical className="h-3 w-3" />
            </button>

            {/* Menu Popover */}
            {activeMenuId === chat.id && (
              <div className="absolute right-0 top-full mt-1 w-28 rounded-lg border border-base-border bg-card p-1 shadow-lg z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={(e) => handleTogglePin(chat.id, e)}
                  className="flex w-full items-center gap-1.5 px-2 py-1.5 text-[11px] rounded text-ink hover:bg-base-subtle"
                >
                  {chat.isPinned ? (
                    <>
                      <PinOff className="h-3 w-3 text-ink-muted" />
                      <span>Unpin</span>
                    </>
                  ) : (
                    <>
                      <Pin className="h-3 w-3 text-ink-muted" />
                      <span>Pin</span>
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => handleStartRename(chat, e)}
                  className="flex w-full items-center gap-1.5 px-2 py-1.5 text-[11px] rounded text-ink hover:bg-base-subtle"
                >
                  <Edit2 className="h-3 w-3 text-ink-muted" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="flex w-full items-center gap-1.5 px-2 py-1.5 text-[11px] rounded text-signal-low hover:bg-signal-low/10"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Reusable Sidebar content component
  const sidebarContent = (
    <div className="flex flex-col h-full space-y-4">
      {/* New Chat Button */}
      <Button
        onClick={handleNewChat}
        className="w-full h-9 text-xs gap-2 rounded-xl shadow-sm justify-start font-medium"
      >
        <Plus className="h-4 w-4" />
        <span>New Chat</span>
      </Button>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold text-accent uppercase tracking-wider">
              <Pin className="h-3 w-3" />
              <span>Pinned ({pinnedConversations.length})</span>
            </div>
            <div className="space-y-0.5">
              {pinnedConversations.map((chat) => renderConversationItem(chat))}
            </div>
          </div>
        )}

        {/* Recent Section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>Recent ({recentConversations.length})</span>
          </div>

          {recentConversations.length === 0 && pinnedConversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-ink-muted/70 italic">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentConversations.map((chat) => renderConversationItem(chat))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex h-8 px-2.5 text-xs gap-1.5 text-ink-muted hover:text-ink"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden h-8 px-2.5 text-xs gap-1.5 text-ink-muted hover:text-ink"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chats</span>
          </Button>

          <PageHeader
            title="DevOS AI Assistant"
            description="Your personalized CS tutor, study planner, and debugging mentor"
            className="pb-0 mb-0 border-b-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="h-8 text-xs gap-1.5 text-ink-muted hover:text-ink"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Desktop Sidebar (Pinned & Recent Chats) */}
        {sidebarOpen && (
          <Card className="hidden md:flex w-64 lg:w-72 flex-col p-3 border-base-border/80 bg-card shrink-0 shadow-sm overflow-hidden">
            {sidebarContent}
          </Card>
        )}

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex">
            <div className="w-72 h-full bg-card border-r border-base-border p-4 flex flex-col shadow-2xl animate-in slide-in-from-left">
              <div className="flex items-center justify-between pb-3 border-b border-base-border/60 mb-3">
                <span className="font-semibold text-xs text-ink uppercase tracking-wider">
                  Conversations
                </span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded text-ink-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">{sidebarContent}</div>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col min-w-0 space-y-3 overflow-hidden">
          {/* Quick Prompts Bar - visible only when user has not typed any query */}
          {!input.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none transition-all duration-200 animate-in fade-in">
              {QUICK_PROMPTS.map((qp, i) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(qp.prompt)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-base-border/70 bg-card hover:bg-base-subtle hover:border-accent/40 text-[11px] font-medium text-ink-muted hover:text-ink whitespace-nowrap transition-all shadow-sm shrink-0"
                  >
                    <Icon className="h-3 w-3 text-accent" />
                    {qp.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Messages Container */}
          <Card className="flex-1 overflow-hidden border-base-border/80 bg-card flex flex-col min-h-0 shadow-sm">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((m) => {
                const isEditingThis = m.role === "user" && editingMessageId === m.id;

                if (isEditingThis) {
                  return (
                    <div key={m.id} className="group flex gap-3 justify-end w-full">
                      <div className="w-full max-w-[92%] sm:max-w-[80%] rounded-2xl border border-accent/50 bg-card p-3 shadow-lg space-y-2 animate-in fade-in zoom-in-95">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit(m.id);
                            }
                            if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          rows={Math.min(6, Math.max(2, editingContent.split("\n").length))}
                          className="w-full resize-none rounded-xl border border-base-border bg-base-subtle/50 p-2.5 text-xs sm:text-sm text-ink focus:border-accent focus:outline-none scrollbar-thin leading-relaxed"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={loading}
                            className="px-2.5 py-1 rounded-lg border border-base-border/70 text-ink-muted hover:text-ink hover:bg-base-subtle transition-colors text-[11px] font-medium"
                          >
                            Cancel
                          </button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSaveEdit(m.id)}
                            disabled={!editingContent.trim() || loading}
                            className="h-7 px-3 text-[11px] gap-1 rounded-lg font-medium shadow-sm"
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                            <span>Save & Resend</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink-muted/15 text-ink border border-base-border">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`group flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div className="max-w-[88%] sm:max-w-[78%] min-w-0">
                      <div
                        className={`overflow-hidden break-words rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-accent text-white shadow-md shadow-accent/10"
                            : "bg-base-subtle/70 border border-base-border/60 text-ink"
                        }`}
                      >
                        <div className="prose-sm dark:prose-invert">
                          {renderFormattedContent(m.content, m.id)}
                        </div>
                        <div
                          className={`mt-2 text-[10px] ${
                            m.role === "user" ? "text-white/70 text-right" : "text-ink-muted"
                          }`}
                        >
                          {m.timestamp}
                        </div>
                      </div>

                      {/* Action buttons (Copy, Edit for User; Copy, Regenerate for Assistant) */}
                      {m.role === "user" ? (
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            type="button"
                            onClick={() => handleCopy(m.content, m.id)}
                            title="Copy message"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-ink-muted hover:text-ink hover:bg-base-subtle/80 transition-colors"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="h-3 w-3 text-signal-high" />
                                <span className="text-signal-high font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(m)}
                            disabled={loading}
                            title="Edit message"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-ink-muted hover:text-ink hover:bg-base-subtle/80 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-start gap-1 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            type="button"
                            onClick={() => handleCopy(m.content, m.id)}
                            title="Copy response"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-ink-muted hover:text-ink hover:bg-base-subtle/80 transition-colors"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="h-3 w-3 text-signal-high" />
                                <span className="text-signal-high font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          {m.id !== "welcome" && (
                            <button
                              type="button"
                              onClick={() => handleRegenerate(m.id)}
                              disabled={loading}
                              title="Regenerate response"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-ink-muted hover:text-ink hover:bg-base-subtle/80 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {m.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink-muted/15 text-ink border border-base-border">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-base-subtle/70 border border-base-border/60 px-4 py-3 text-xs text-ink-muted flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 sm:p-4 border-t border-base-border/60 bg-base-subtle/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your studies, DSA, code debugging, or today's tasks..."
                  className="flex-1 max-h-32 min-h-[42px] resize-none rounded-xl border border-base-border bg-card px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:border-accent focus:outline-none leading-relaxed"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="h-[42px] px-4 text-xs gap-1.5 rounded-xl shadow-md shadow-accent/15 shrink-0 font-medium"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

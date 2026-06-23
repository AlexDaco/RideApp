"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Send, ArrowLeft, User, Circle } from "lucide-react";

interface Conversation {
  userId: string;
  username: string;
  avatarUrl: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  fromUser: { id: string; username: string };
  toUser: { id: string; username: string };
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUser = searchParams.get("to");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(preselectedUser);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => { setConversations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    const res = await fetch(`/api/messages/${userId}`);
    const data = await res.json();
    setMessages(data);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser);
      const conv = conversations.find((c) => c.userId === selectedUser);
      if (conv) setSelectedUsername(conv.username);

      const interval = setInterval(() => loadMessages(selectedUser), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, loadMessages, conversations]);

  useEffect(() => {
    if (preselectedUser && !conversations.find((c) => c.userId === preselectedUser)) {
      fetch(`/api/riders/${preselectedUser}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setSelectedUsername(data.username);
          }
        })
        .catch(() => {});
    }
  }, [preselectedUser, conversations]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: selectedUser, content: newMessage.trim() }),
    });

    if (res.ok) {
      setNewMessage("");
      await loadMessages(selectedUser);
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div
        className={`w-full sm:w-80 bg-moto-dark border-r border-moto-blue/30 flex flex-col ${
          selectedUser ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-moto-blue/30">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-moto-accent" />
            Nachrichten
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageCircle className="w-10 h-10 text-moto-muted mx-auto mb-3" />
              <p className="text-moto-muted text-sm">
                Noch keine Nachrichten. Besuche ein Fahrerprofil, um eine Konversation zu starten.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedUser(conv.userId)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-moto-surface transition-colors border-b border-moto-blue/10 ${
                  selectedUser === conv.userId ? "bg-moto-surface" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-moto-card flex items-center justify-center text-moto-accent font-bold shrink-0">
                  {conv.username[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{conv.username}</p>
                    {conv.unread && <Circle className="w-2 h-2 fill-moto-accent text-moto-accent" />}
                  </div>
                  <p className="text-moto-muted text-xs truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col ${
          selectedUser ? "flex" : "hidden sm:flex"
        }`}
      >
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-moto-blue/30 flex items-center gap-3 bg-moto-dark/50">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden text-moto-muted hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-moto-card flex items-center justify-center text-moto-accent font-bold text-sm">
                {selectedUsername?.[0]?.toUpperCase() ?? "?"}
              </div>
              <p className="text-white font-medium">{selectedUsername}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.fromUser.id === session?.user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMine
                          ? "bg-moto-accent text-white rounded-br-sm"
                          : "bg-moto-surface text-moto-text rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? "text-white/60" : "text-moto-muted"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-moto-blue/30 bg-moto-dark/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nachricht schreiben..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="input-field flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="btn-primary !py-3 !px-4"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 text-moto-muted mx-auto mb-4" />
              <p className="text-moto-muted text-lg">Wähle eine Konversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

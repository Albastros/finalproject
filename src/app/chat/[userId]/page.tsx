"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  message: string;
  createdAt: string;
}

interface UserInfo {
  name: string;
  avatar: string | null;
}

interface Conversation {
  userId: string;
  name?: string;
  avatar?: string | null;
  lastMessage: string;
  lastTimestamp: string;
  read: boolean;
}

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      const res = await fetch(`/api/messages/${userId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setUsers(data.users || {});
      setLoading(false);
    }
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    async function fetchConversations() {
      setConvLoading(true);
      const res = await fetch("/api/messages/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
      setConvLoading(false);
    }
    fetchConversations();
  }, []);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: userId, message: input }),
    });
    setInput("");
    setSending(false);
    // Re-fetch messages
    const res = await fetch(`/api/messages/${userId}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setUsers(data.users || {});
  }

  // Get myId from users (the one that's not userId)
  const myId = Object.keys(users).find((id) => id !== userId) || "me";
  const otherUser = users[userId];
  const me = users[myId];

  const filtered = conversations.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex h-[90vh] max-w-7xl  mx-auto bg-white rounded-lg shadow overflow-hidden my-3 ">
      {/* Left: Conversation List */}
      <div className="w-full md:w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <input
            className="w-full px-3 py-2 rounded bg-gray-100 border focus:outline-none"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="p-4 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-gray-400">No conversations yet.</div>
          ) : (
            filtered.map((conv) => (
              <Link key={conv.userId} href={`/chat/${conv.userId}`} className="block">
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-100 transition ${!conv.read ? "bg-blue-50" : ""} ${conv.userId === userId ? "bg-blue-200" : ""}`}
                >
                  {conv.avatar ? (
                    <Image
                      src={conv.avatar}
                      alt={conv.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                      {conv.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{conv.name || conv.userId}</div>
                    <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">
                      {new Date(conv.lastTimestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {!conv.read && <span className="w-2 h-2 rounded-full bg-blue-500 block" />}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      {/* Right: Chat Thread */}
      <div className="flex-1 flex flex-col  relative">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-6 py-4 bg-gray-50">
          {otherUser?.avatar ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
              {otherUser?.name?.[0] || "?"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-base">{otherUser?.name || userId}</span>
          </div>
        </div>
        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50"
          style={{ paddingBottom: "80px" }}
        >
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400">No messages yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === myId;
                const user = isMe ? me : otherUser;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-500">
                          {user?.name?.[0] || "?"}
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 shadow text-sm ${isMe ? "bg-blue-500 text-white" : "bg-white text-gray-900 border"}`}
                      >
                        {msg.message}
                        <div className="text-[10px] text-gray-400 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {/* Input - fixed at bottom */}
        <form
          onSubmit={handleSend}
          className="flex gap-2 p-4 border-t bg-white w-full absolute bottom-0 left-0 right-0"
          // style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        >
          <input
            className="flex-1 border rounded-full px-4 py-2 bg-gray-100 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !input.trim()} className="rounded-full px-6">
            Send
          </Button>
        </form>
      </div>
    </main>
  );
}

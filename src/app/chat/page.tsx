"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Conversation {
  userId: string;
  name?: string;
  avatar?: string | null;
  lastMessage: string;
  lastTimestamp: string;
  read: boolean;
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      const res = await fetch("/api/messages/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
      setLoading(false);
    }
    fetchConversations();
  }, []);

  const filtered = conversations.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex h-[100vh] max-w-7xl mx-auto bg-white rounded-lg shadow overflow-hidden my-6">
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
          {loading ? (
            <div className="p-4 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-gray-400">No conversations yet.</div>
          ) : (
            filtered.map((conv) => (
              <Link key={conv.userId} href={`/chat/${conv.userId}`} className="block">
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-100 transition ${!conv.read ? "bg-blue-50" : ""}`}
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
      {/* Right: Placeholder for thread */}
      <div className="flex-1 hidden md:flex items-center justify-center text-gray-400 text-lg">
        Select a conversation to start chatting
      </div>
    </main>
  );
}

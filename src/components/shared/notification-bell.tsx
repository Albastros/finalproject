"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import axios from "axios";

interface Notification {
  _id: string;
  message: string;
  link?: string;
  type: "info" | "warning" | "alert";
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchNotifications();
    // eslint-disable-next-line
  }, [open]);

  async function fetchNotifications() {
    setLoading(true);
    const res = await axios.get("/api/notifications");
    setNotifications(res.data.notifications);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await axios.patch(`/api/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="w-6 h-6" />
          {hasUnread && (
            <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="font-semibold px-2 py-1">Notifications</div>
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n._id}
              className={`flex flex-col items-start gap-1 ${!n.read ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
              onClick={() => {
                if (!n.read) markAsRead(n._id);
                if (n.link) window.location.href = n.link;
              }}
            >
              <span className="text-sm font-medium">{n.message}</span>
              <span className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

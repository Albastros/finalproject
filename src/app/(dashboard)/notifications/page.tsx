"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Notification {
  _id: string;
  message: string;
  link?: string;
  type: "info" | "warning" | "alert";
  read: boolean;
  createdAt: string;
}

async function fetchNotifications(): Promise<Notification[]> {
  const res = await axios.get("/api/notifications");
  return res.data.notifications;
}

function NotificationList({
  notifications,
  onMarkAsRead,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return <div className="p-4 text-center text-gray-500">No notifications</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <Card
          key={n._id}
          className={`flex flex-col md:flex-row items-start md:items-center gap-2 p-4 cursor-pointer border ${!n.read ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" : ""}`}
          onClick={() => !n.read && onMarkAsRead(n._id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  n.type === "alert"
                    ? "destructive"
                    : n.type === "warning"
                      ? "secondary"
                      : "default"
                }
              >
                {n.type}
              </Badge>
              {!n.read && <span className="text-xs text-blue-500">Unread</span>}
            </div>
            <div className="mt-1 text-sm font-medium">{n.message}</div>
            <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
          {n.link && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = n.link!;
              }}
            >
              View
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  // Client component for interactivity
  // Use Suspense for loading fallback
  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={<div className="p-4 text-center text-gray-500">Loading notifications...</div>}
          >
            <NotificationsClient />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  async function markAsRead(id: string) {
    await axios.patch(`/api/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  }

  if (loading) return <div className="p-4 text-center text-gray-500">Loading notifications...</div>;
  return <NotificationList notifications={notifications} onMarkAsRead={markAsRead} />;
}

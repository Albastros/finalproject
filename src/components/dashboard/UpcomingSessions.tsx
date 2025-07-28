"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { format, parseISO, addMinutes, isWithinInterval } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Link from "next/link";

interface Booking {
  _id: string;
  tutorId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
  // Add more fields as needed
}

export function UpcomingSessions() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchTutorName = useCallback(
    async (tutorId: string) => {
      if (tutorNames[tutorId]) return tutorNames[tutorId];
      const res = await fetch(`/api/users?id=${tutorId}`);
      const data = await res.json();
      const name = data.user?.name || tutorId;
      setTutorNames((prev) => ({ ...prev, [tutorId]: name }));
      return name;
    },
    [tutorNames]
  );

  const fetchSessions = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(
        `/api/bookings?studentId=${session.user.id}&status=confirmed&fromDate=${today}`
      );
      if (res.ok) {
        const data = await res.json();
        setSessions(data.bookings || []);
      } else {
        console.error('Failed to fetch sessions:', res.statusText);
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    async function fetchAllTutorNames() {
      const uniqueTutorIds = Array.from(new Set(sessions.map((s) => s.tutorId)));
      await Promise.all(uniqueTutorIds.map((id) => fetchTutorName(id)));
    }
    if (sessions.length) fetchAllTutorNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-24 bg-muted rounded-lg" />
        <div className="animate-pulse h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!sessions.length) {
    return <div className="text-muted-foreground">No upcoming sessions.</div>;
  }

  function canJoinSession(session: Booking) {
    const sessionStart = parseISO(`${session.sessionDate}T${session.sessionTime}`);
    const now = new Date();
    return isWithinInterval(now, {
      start: addMinutes(sessionStart, -15),
      end: addMinutes(sessionStart, 60),
    });
  }

  function getSessionButtonLabel(session: Booking) {
    const sessionStart = parseISO(`${session.sessionDate}T${session.sessionTime}`);
    const now = new Date();
    if (now < addMinutes(sessionStart, -15)) {
      return "Join opens 15 min before";
    }
    if (now > addMinutes(sessionStart, 60)) {
      return "Session Not Available";
    }
    return "Join Session";
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sessions.map((session) => (
        <Card key={session._id} className="max-w-md w-full mx-auto">
          <CardHeader className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-muted mb-2 flex items-center justify-center text-2xl font-bold text-gray-500">
              {tutorNames[session.tutorId]?.[0] || "?"}
            </div>
            <CardTitle className="text-lg">
              Tutor: {tutorNames[session.tutorId] || session.tutorId}
            </CardTitle>
            <div className="text-xs text-muted-foreground">{session.subject}</div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <div className="text-sm font-medium">
              {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
                ? format(parseISO(session.sessionDate), "MMM d, yyyy")
                : "Invalid date"}
              <br />
              {session.sessionTime}
            </div>
            <div className="flex gap-2 mt-2">
              <div className="w-full relative">
                {session.status === "confirmed" && (
                  <Button
                    asChild
                    disabled={!canJoinSession(session)}
                    className={`w-full ${"bg-slate-600 hover:bg-slate-700"}`}
                  >
                    <Link href={`/session/${session._id}/join`}>Join Session</Link>
                  </Button>
                )}
                {/* {!canJoinSession(session) && (
                  <div className="absolute left-0 right-0 mt-1 text-xs text-yellow-700 bg-yellow-100 dark:bg-yellow-900 rounded px-2 py-1 text-center">
                    {getSessionButtonLabel(session)}
                  </div>
                )} */}
              </div>
              <Link href={`/chat/${session.tutorId}`}>
                <Button variant="outline">Message Tutor</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

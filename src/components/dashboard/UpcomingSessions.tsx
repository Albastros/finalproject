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
    <div className="grid gap-10 md:grid-cols-2">
      {sessions.map((session) => (
        <Card
          key={session._id}
          className="max-w-md w-full mx-auto relative overflow-hidden border-none shadow-xl backdrop-blur-lg bg-white/40 bg-gradient-to-br from-blue-100/60 via-white/80 to-purple-100/60 transition-transform hover:scale-[1.03] hover:shadow-2xl"
          style={{ borderRadius: '2rem', border: '1px solid rgba(180,180,255,0.18)' }}
        >
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-2xl -z-10" />
          <CardHeader className="flex flex-col items-center relative pb-2 pt-6">
            {/* Animated status badge */}
            <span className={`absolute top-4 right-6 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${session.status === 'confirmed' ? 'bg-green-200 text-green-700 animate-pulse' : 'bg-yellow-200 text-yellow-700'}`}
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
            {/* Tutor avatar (image or initials) */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-300 mb-2 flex items-center justify-center text-4xl font-extrabold text-white shadow-lg border-4 border-white">
              {/* If you have tutor image, use <img src={...} /> here */}
              {tutorNames[session.tutorId]?.[0] || "?"}
            </div>
            <CardTitle className="text-2xl font-bold text-blue-700 flex flex-col items-center">
              {tutorNames[session.tutorId] || session.tutorId}
              <span className="text-xs text-muted-foreground font-normal mt-1">Tutor</span>
            </CardTitle>
            {/* Tutor rating (if available) */}
            {/* <TutorRatingDisplay tutorId={session.tutorId} /> */}
            <div className="mt-2 flex gap-2 items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" /></svg>
              <span className="text-xs text-gray-500">4.8</span>
              <svg className="w-4 h-4 text-pink-400 ml-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18l-1.45-1.32C4.4 12.36 2 9.28 2 6.5 2 4.42 3.42 3 5.5 3c1.54 0 3.04.99 3.57 2.36h1.87C11.46 3.99 12.96 3 14.5 3 16.58 3 18 4.42 18 6.5c0 2.78-2.4 5.86-6.55 10.18L10 18z" /></svg>
            </div>
            <div className="text-sm text-purple-700 font-medium mt-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v2a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H6zm8 6H6a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V9a1 1 0 00-1-1z" /></svg>
              {session.subject}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6">
            <div className="flex gap-4 items-center text-base font-semibold text-gray-700">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v2a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H6zm8 6H6a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V9a1 1 0 00-1-1z" /></svg>
                {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
                  ? format(parseISO(session.sessionDate), "MMM d, yyyy")
                  : "Invalid date"}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
                <span className="font-mono text-blue-600">{session.sessionTime}</span>
              </span>
            </div>
            <div className="flex gap-2 mt-2 w-full justify-center">
              <div className="w-full relative">
                {session.status === "confirmed" && (
                  <Button
                    asChild
                    disabled={!canJoinSession(session)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105"
                  >
                    <Link href={`/session/${session._id}/join`}>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 10a7 7 0 1114 0A7 7 0 013 10zm7-4a1 1 0 00-1 1v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7a1 1 0 00-1-1z" /></svg>
                        Join Session
                      </span>
                    </Link>
                  </Button>
                )}
                {!canJoinSession(session) && (
                  <div className="absolute left-0 right-0 mt-1 text-xs text-yellow-700 bg-yellow-100 dark:bg-yellow-900 rounded px-2 py-1 text-center animate-pulse">
                    {getSessionButtonLabel(session)}
                  </div>
                )}
              </div>
              <Link href={`/chat/${session.tutorId}`}>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:scale-105">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2 0v10h12V5H4zm2 2h8v2H6V7zm0 4h5v2H6v-2z" /></svg>
                    Message Tutor
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

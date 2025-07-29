"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { format, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

interface Booking {
  _id: string;
  studentId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
}

export function TutorPastSessions() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentName = useCallback(
    async (studentId: string) => {
      if (studentNames[studentId]) return studentNames[studentId];
      const res = await fetch(`/api/users?id=${studentId}`);
      const data = await res.json();
      const name = data.user?.name || studentId;
      setStudentNames((prev) => ({ ...prev, [studentId]: name }));
      return name;
    },
    [studentNames]
  );

  useEffect(() => {
    async function fetchSessions() {
      if (!session?.user?.id) return;
      setIsLoading(true);
      const res = await fetch(`/api/bookings?tutorId=${session.user.id}&status=completed`);
      const data = await res.json();
      setSessions(data.bookings || []);
      setIsLoading(false);
    }
    fetchSessions();
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchAllStudentNames() {
      const uniqueStudentIds = Array.from(new Set(sessions.map((s) => s.studentId)));
      await Promise.all(uniqueStudentIds.map((id) => fetchStudentName(id)));
    }
    if (sessions.length) fetchAllStudentNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse h-[260px] rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-xl" />
        ))}
      </div>
    );
  }

  if (!sessions.length) {
    return <div className="text-center py-12 text-lg text-indigo-400 font-semibold">No past sessions.</div>;
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {sessions.map((session) => {
        // Color palette for creative cards
        const cardColors = [
          {
            bg: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
            header: "bg-gradient-to-r from-indigo-500 to-purple-600",
            accent: "from-indigo-400 to-purple-500",
            border: "border-indigo-200",
            tagBg: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
            badgeBg: "bg-purple-200 text-purple-900 hover:bg-purple-300"
          },
          {
            bg: "bg-gradient-to-br from-blue-50 to-indigo-100/80",
            header: "bg-gradient-to-r from-blue-500 to-indigo-600",
            accent: "from-blue-400 to-indigo-500",
            border: "border-blue-200",
            tagBg: "bg-blue-100 text-blue-800 hover:bg-blue-200",
            badgeBg: "bg-blue-200 text-blue-900 hover:bg-blue-300"
          },
          {
            bg: "bg-gradient-to-br from-rose-50 to-pink-100/80",
            header: "bg-gradient-to-r from-rose-500 to-pink-600",
            accent: "from-rose-400 to-pink-500",
            border: "border-rose-200",
            tagBg: "bg-rose-100 text-rose-800 hover:bg-rose-200",
            badgeBg: "bg-rose-200 text-rose-900 hover:bg-rose-300"
          }
        ];
        const colorIndex = session._id ? session._id.length % cardColors.length : 0;
        const colors = cardColors[colorIndex];
        return (
          <Card key={session._id} className={`relative flex flex-col min-h-[260px] h-full overflow-hidden ${colors.bg} shadow-xl hover:shadow-2xl transition-all duration-700 group hover:scale-[1.03] hover:-translate-y-2 rounded-3xl border-2 ${colors.border} backdrop-blur-sm w-full max-w-md mx-auto`}>
            {/* Ultra Enhanced Header with complex patterns */}
            <div className={`h-16 ${colors.header} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-white/20 animate-pulse" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_50%)]" />
              {/* Enhanced decorative elements */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/15 rounded-full transform rotate-45 group-hover:rotate-90 transition-transform duration-700" />
              <div className="absolute top-2 right-8 w-4 h-4 bg-white/20 rounded-full group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute -bottom-1 left-4 w-6 h-6 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-600" />
              <div className="absolute top-1 left-1 w-3 h-3 bg-white/25 transform rotate-45 group-hover:rotate-180 transition-transform duration-800" />
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.accent} opacity-90 group-hover:h-1.5 transition-all duration-500`} />
            </div>

            {/* Avatar */}
            <div className="absolute left-1/2 top-10 -translate-x-1/2 z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-lg font-bold text-white shadow border-2 border-white">
                {studentNames[session.studentId]?.[0] || "?"}
              </div>
            </div>

            <CardHeader className="flex flex-col items-center mt-8 pb-2">
              <CardTitle className="text-base text-center font-semibold text-slate-700 group-hover:text-indigo-500 transition-colors duration-300">
                Student: {studentNames[session.studentId] || session.studentId}
              </CardTitle>
              <div className="text-xs text-indigo-500 font-medium mt-1">{session.subject}</div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col items-center gap-2 px-6 pb-6">
              {/* Date & Time */}
              <div className="text-sm font-medium text-slate-600 text-center">
                {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
                  ? format(parseISO(session.sessionDate), "MMM d, yyyy")
                  : "Invalid date"}
                <span className="mx-2">|</span>
                {session.sessionTime}
              </div>
              {/* Status Badge */}
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${colors.badgeBg} text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 mt-2`}>
                {session.status}
              </div>
              {/* Message Button */}
              <Link href={`/chat/${session.studentId}`} className="w-full mt-2">
                <Button size="sm" variant="outline" className={`w-full text-indigo-700 border-indigo-300 font-semibold rounded-xl px-4 py-2 transition-all hover:bg-indigo-50 hover:scale-105 hover:shadow`}>
                  Message Student
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

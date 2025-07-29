"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { format, parseISO } from "date-fns";
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

export function TutorAllSessions() {
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
      const res = await fetch(`/api/bookings?tutorId=${session.user.id}`);
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
      <div className="space-y-4">
        <div className="animate-pulse h-24 bg-muted rounded-lg" />
        <div className="animate-pulse h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!sessions.length) {
    return <div className="text-muted-foreground">No sessions found.</div>;
  }

  return (
    <div className="overflow-x-auto w-full">
      <div className="rounded-3xl shadow-2xl border border-blue-200/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl max-w-5xl mx-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100">
              <th className="px-6 py-4 text-lg font-extrabold text-blue-700 tracking-tight rounded-tl-3xl">Student</th>
              <th className="px-6 py-4 text-lg font-extrabold text-indigo-700 tracking-tight">Subject</th>
              <th className="px-6 py-4 text-lg font-extrabold text-purple-700 tracking-tight">Date</th>
              <th className="px-6 py-4 text-lg font-extrabold text-blue-700 tracking-tight">Time</th>
              <th className="px-6 py-4 text-lg font-extrabold text-green-700 tracking-tight rounded-tr-3xl">Status</th>
              <th className="px-6 py-4 text-lg font-extrabold text-indigo-700 tracking-tight">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, idx) => (
              <tr
                key={session._id}
                className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 ${idx % 2 === 0 ? 'bg-white/60 dark:bg-slate-800/60' : 'bg-blue-50/40 dark:bg-slate-700/40'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-400 to-purple-400 flex items-center justify-center text-xl font-bold text-white shadow border-2 border-white">
                    {studentNames[session.studentId]?.[0] || "?"}
                  </div>
                  <span className="font-semibold text-blue-700">{studentNames[session.studentId] || session.studentId}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-tr from-orange-100 via-pink-100 to-purple-100 text-orange-700 font-semibold text-sm shadow border border-orange-200/40">
                    {session.subject}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-tr from-blue-100 via-indigo-100 to-purple-100 text-blue-700 font-semibold text-sm shadow border border-blue-200/40">
                    {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
                      ? format(parseISO(session.sessionDate), "MMM d, yyyy")
                      : "Invalid date"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-tr from-indigo-100 via-blue-100 to-purple-100 text-indigo-700 font-semibold text-sm shadow border border-indigo-200/40">
                    <span className="font-mono">{session.sessionTime}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-xs shadow border ${session.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : session.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold shadow-lg rounded-xl px-4 py-2 text-xs transition-all hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-purple-600">
                      <Link href={`/session/${session._id}/join`}>Join</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-indigo-300 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl px-4 py-2 text-xs transition-all hover:bg-indigo-50 hover:scale-105 hover:shadow">
                      <Link href={`/chat/${session.studentId}`}>Message</Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

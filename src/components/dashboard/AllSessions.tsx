"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { format, parseISO } from "date-fns";
import { Card } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

interface Material {
  _id: string;
  title?: string;
  fileUrl: string;
  uploadedAt: string;
}

interface Booking {
  _id: string;
  tutorId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
}

export function AllSessions() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [materialsBySession, setMaterialsBySession] = useState<Record<string, Material[]>>({});

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

  useEffect(() => {
    async function fetchSessions() {
      if (!session?.user?.id) return;
      setIsLoading(true);
      const res = await fetch(`/api/bookings?studentId=${session.user.id}`);
      const data = await res.json();
      setSessions(data.bookings || []);
      setIsLoading(false);
    }
    fetchSessions();
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchAllTutorNames() {
      const uniqueTutorIds = Array.from(new Set(sessions.map((s) => s.tutorId)));
      await Promise.all(uniqueTutorIds.map((id) => fetchTutorName(id)));
    }
    if (sessions.length) fetchAllTutorNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  useEffect(() => {
    async function fetchMaterials() {
      const results: Record<string, Material[]> = {};
      await Promise.all(
        sessions.map(async (session) => {
          const res = await fetch(`/api/materials?sessionId=${session._id}`);
          const data = await res.json();
          results[session._id] = data.materials || [];
        })
      );
      setMaterialsBySession(results);
    }
    if (sessions.length) fetchMaterials();
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
              <th className="px-6 py-4 text-lg font-extrabold text-blue-700 tracking-tight rounded-tl-3xl">Tutor</th>
              <th className="px-6 py-4 text-lg font-extrabold text-indigo-700 tracking-tight">Subject</th>
              <th className="px-6 py-4 text-lg font-extrabold text-purple-700 tracking-tight">Date</th>
              <th className="px-6 py-4 text-lg font-extrabold text-blue-700 tracking-tight">Time</th>
              <th className="px-6 py-4 text-lg font-extrabold text-green-700 tracking-tight rounded-tr-3xl">Status</th>
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
                    {tutorNames[session.tutorId]?.[0] || "?"}
                  </div>
                  <span className="font-semibold text-blue-700">{tutorNames[session.tutorId] || session.tutorId}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-tr from-orange-100 via-pink-100 to-purple-100 text-orange-700 font-semibold text-sm shadow border border-orange-200/40">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" d="M8 12h8"/></svg>
                    {session.subject}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-tr from-blue-100 via-indigo-100 to-purple-100 text-blue-700 font-semibold text-sm shadow border border-blue-200/40">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4" strokeWidth="2"/><path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
                      ? format(parseISO(session.sessionDate), "MMM d, yyyy")
                      : "Invalid date"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-tr from-indigo-100 via-blue-100 to-purple-100 text-indigo-700 font-semibold text-sm shadow border border-indigo-200/40">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" d="M12 6v6l4 2"/></svg>
                    <span className="font-mono">{session.sessionTime}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-xs shadow border ${session.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

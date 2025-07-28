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
    <div className="flex flex-col gap-8">
      {sessions.map((session) => (
        <Card
          key={session._id}
          className="relative overflow-hidden border-none shadow-xl backdrop-blur-lg bg-white/40 bg-gradient-to-br from-blue-100/60 via-white/80 to-purple-100/60 transition-transform hover:scale-[1.02] hover:shadow-2xl px-6 py-6"
          style={{ borderRadius: '2rem', border: '1px solid rgba(180,180,255,0.18)' }}
        >
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-2xl -z-10" />
          <div className="flex flex-row items-center gap-6 w-full">
            {/* Tutor avatar and name */}
            <div className="flex flex-col items-center min-w-[90px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-300 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg border-4 border-white mb-2">
                {tutorNames[session.tutorId]?.[0] || "?"}
              </div>
              <span className="text-lg font-bold text-blue-700 text-center">{tutorNames[session.tutorId] || session.tutorId}</span>
              <span className="text-xs text-muted-foreground font-normal">Tutor</span>
            </div>
            {/* Session info horizontally aligned */}
            <div className="flex flex-row flex-1 items-center gap-8 justify-between">
              <div className="flex flex-col items-center gap-2">
                <span className="flex items-center gap-2 text-purple-700 font-medium">
                  {/* Notebook icon for course */}
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2h8v2H6V7zm0 3h8v2H6v-2zm0 3h5v2H6v-2z"/>
                  </svg>
                  {session.subject}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="flex items-center gap-1 text-base font-semibold text-gray-700">
                  {/* Calendar icon for date */}
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z"/>
                  </svg>
                  {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
                    ? format(parseISO(session.sessionDate), "MMM d, yyyy")
                    : "Invalid date"}
                </span>
                <span className="flex items-center gap-1 text-base font-semibold text-gray-700">
                  {/* Clock icon for time */}
                  <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 4.5V10l3 1.5-1 1.732-4-2V6.5h2z"/>
                  </svg>
                  <span className="font-mono text-blue-600">{session.sessionTime}</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${session.status === 'confirmed' ? 'bg-green-200 text-green-700 animate-pulse' : 'bg-yellow-200 text-yellow-700'}`}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

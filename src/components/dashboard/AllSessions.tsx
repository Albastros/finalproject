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
    <div className="grid gap-4">
      {sessions.map((session) => (
        <Card
          key={session._id}
          className="rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow"
        >
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-gray-500">
              {tutorNames[session.tutorId]?.[0] || "?"}
            </div>
            <div>
              <div className="font-medium">
                Tutor: {tutorNames[session.tutorId] || session.tutorId}
              </div>
              <div className="text-xs text-muted-foreground">{session.subject}</div>
            </div>
          </div>
          <div className="text-sm font-medium">
            {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
              ? format(parseISO(session.sessionDate), "MMM d, yyyy")
              : "Invalid date"}
            <br />
            {session.sessionTime}
          </div>
          <div className="flex flex-col gap-2 ml-0 md:ml-4 mt-2 md:mt-0">
            <div className="text-xs font-semibold px-2 py-1 rounded bg-muted">{session.status}</div>
            <Link href={`/chat/${session.tutorId}`}>
              <Button size="sm" variant="outline">
                Message Tutor
              </Button>
            </Link>
            {/* Always show Join Session button for students */}
            <Link href={`/session/${session._id}/join`}>
              <Button size="sm" variant="default">
                Join Session
              </Button>
            </Link>
            {/* Materials for this session */}
            {materialsBySession[session._id]?.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs mb-1">Materials</div>
                <ul className="space-y-1">
                  {materialsBySession[session._id].map((mat) => (
                    <li key={mat._id} className="flex items-center gap-2">
                      <span className="truncate max-w-[100px]" title={mat.title || mat.fileUrl}>
                        {mat.title || "Untitled PDF"}
                      </span>
                      <a
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-xs"
                      >
                        View/Download
                      </a>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(mat.uploadedAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

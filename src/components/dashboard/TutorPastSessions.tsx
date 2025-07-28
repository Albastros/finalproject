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
      <div className="space-y-4">
        <div className="animate-pulse h-24 bg-muted rounded-lg" />
        <div className="animate-pulse h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!sessions.length) {
    return <div className="text-muted-foreground">No past sessions.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sessions.map((session) => (
        <Card key={session._id} className="max-w-md w-full mx-auto">
          <CardHeader className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-muted mb-2 flex items-center justify-center text-2xl font-bold text-gray-500">
              {studentNames[session.studentId]?.[0] || "?"}
            </div>
            <CardTitle className="text-lg">
              Student: {studentNames[session.studentId] || session.studentId}
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
            <div className="text-xs font-semibold px-2 py-1 rounded bg-muted mt-2">
              {session.status}
            </div>
            <Link href={`/chat/${session.studentId}`} className="w-full mt-2">
              <Button size="sm" variant="outline" className="w-full">
                Message Student
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

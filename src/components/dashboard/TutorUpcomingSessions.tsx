"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { format, parseISO, addMinutes, isWithinInterval } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Pen } from "lucide-react";

interface Booking {
  _id: string;
  studentId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
}

export function TutorUpcomingSessions() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const fetchSessions = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(
        `/api/bookings?tutorId=${session.user.id}&status=confirmed&fromDate=${today}`
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
    async function fetchAllStudentNames() {
      const uniqueStudentIds = Array.from(new Set(sessions.map((s) => s.studentId)));
      await Promise.all(uniqueStudentIds.map((id) => fetchStudentName(id)));
    }
    if (sessions.length) fetchAllStudentNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  function canJoinSession(session: Booking) {
    const sessionStart = parseISO(`${session.sessionDate}T${session.sessionTime}`);
    const now = new Date();
    return isWithinInterval(now, {
      start: addMinutes(sessionStart, -15),
      end: addMinutes(sessionStart, 60),
    });
  }

  async function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSession) return;
    // Check if new date/time is in the past
    const now = new Date();
    const selectedDateTime = new Date(`${newDate}T${newTime}`);
    if (selectedDateTime < now) {
      alert("You can only reschedule from today. This time or date is in the past.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/bookings/reschedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: selectedSession._id,
        newDate,
        newTime,
        note: reason,
      }),
    });
    setSubmitting(false);
    setRescheduleModal(false);
    setSelectedSession(null);
    setNewDate("");
    setNewTime("");
    setReason("");
    if (res.ok) {
      // Small delay to ensure database consistency
      setTimeout(async () => {
        // Refetch sessions to update the UI with new time
        await fetchSessions();
      }, 500);
      alert("Session rescheduled!");
    } else {
      const errorData = await res.json();
      alert(`Failed to reschedule session: ${errorData.error || 'Unknown error'}`);
    }
  }

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

  return (
    <>
      <Dialog open={rescheduleModal} onOpenChange={setRescheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="flex flex-col gap-4">
            <label htmlFor="new-date">New Date</label>
            <Input
              id="new-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
            <label htmlFor="new-time">New Time</label>
            <Input
              id="new-time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
            <label htmlFor="reason">Reason (optional)</label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rescheduling (optional)"
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Rescheduling..." : "Save"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="grid gap-6 md:grid-cols-2">
        {sessions.map((session) => (
          <Card key={session._id} className="max-w-md w-full mx-auto">
            <CardHeader className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-muted mb-2 flex items-center justify-center text-2xl font-bold text-gray-500">
                {studentNames[session.studentId]?.[0] || "?"}
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                Student: {studentNames[session.studentId] || session.studentId}
                <button
                  type="button"
                  className="ml-2 p-1 rounded hover:bg-muted"
                  title="Reschedule Session"
                  onClick={() => {
                    setSelectedSession(session);
                    setNewDate(session.sessionDate);
                    setNewTime(session.sessionTime);
                    setReason("");
                    setRescheduleModal(true);
                  }}
                >
                  <Pen className="w-4 h-4" />
                </button>
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
                <Button asChild>
                  <Link href={`/session/${session._id}/join`}>Join Session</Link>
                </Button>
                <Link href={`/chat/${session.studentId}`}>
                  <Button variant="outline">Message Student</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

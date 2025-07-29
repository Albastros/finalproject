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
import { Pen, Users, ChevronDown, ChevronUp } from "lucide-react";

interface Booking {
  _id: string;
  studentId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
  sessionType?: string;
  groupId?: string;
}

interface GroupedSession {
  _id: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
  sessionType: string;
  students: Array<{
    studentId: string;
    bookingId: string;
    studentName: string;
  }>;
  groupId?: string;
}

export function TutorUpcomingSessions() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSession[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GroupedSession | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [studentsModal, setStudentsModal] = useState(false);
  const [selectedGroupSession, setSelectedGroupSession] = useState<GroupedSession | null>(null);

  const fetchStudentName = useCallback(
    async (studentId: string) => {
      if (studentNames[studentId]) return studentNames[studentId];
      try {
        const res = await fetch(`/api/users?id=${studentId}`);
        const data = await res.json();
        const name = data.user?.name || studentId;
        setStudentNames((prev) => ({ ...prev, [studentId]: name }));
        return name;
      } catch (error) {
        console.error('Error fetching student name:', error);
        return studentId;
      }
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

  // Group sessions by date, time, and type
  const groupSessions = useCallback(async (sessions: Booking[]) => {
    const grouped: Record<string, GroupedSession> = {};
    
    for (const session of sessions) {
      const key = `${session.sessionDate}-${session.sessionTime}-${session.subject}-${session.sessionType || 'individual'}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          _id: session._id,
          sessionDate: session.sessionDate,
          sessionTime: session.sessionTime,
          subject: session.subject,
          status: session.status,
          sessionType: session.sessionType || 'individual',
          students: [],
          groupId: session.groupId,
        };
      }
      
      const studentName = await fetchStudentName(session.studentId);
      grouped[key].students.push({
        studentId: session.studentId,
        bookingId: session._id,
        studentName,
      });
    }
    
    return Object.values(grouped);
  }, [fetchStudentName]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    async function processGroupedSessions() {
      if (sessions.length) {
        const grouped = await groupSessions(sessions);
        setGroupedSessions(grouped);
      }
    }
    processGroupedSessions();
  }, [sessions, groupSessions]);

  function canJoinSession(session: GroupedSession) {
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
    
    const now = new Date();
    const selectedDateTime = new Date(`${newDate}T${newTime}`);
    if (selectedDateTime < now) {
      alert("You can only reschedule from today. This time or date is in the past.");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // For group sessions, reschedule all bookings in the group
      const bookingIds = selectedSession.students.map(s => s.bookingId);
      
      const reschedulePromises = bookingIds.map(bookingId =>
        fetch("/api/bookings/reschedule", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            newDate,
            newTime,
            note: reason,
          }),
        })
      );
      
      const results = await Promise.all(reschedulePromises);
      const allSuccessful = results.every(res => res.ok);
      
      if (allSuccessful) {
        setTimeout(async () => {
          await fetchSessions();
        }, 500);
        alert("Session rescheduled!");
      } else {
        alert("Failed to reschedule some sessions. Please try again.");
      }
    } catch (error) {
      console.error('Error rescheduling:', error);
      alert("Failed to reschedule session. Please try again.");
    } finally {
      setSubmitting(false);
      setRescheduleModal(false);
      setSelectedSession(null);
      setNewDate("");
      setNewTime("");
      setReason("");
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

  if (!groupedSessions.length) {
    return <div className="text-muted-foreground">No upcoming sessions.</div>;
  }

  return (
    <>
      {/* Reschedule Modal */}
      <Dialog open={rescheduleModal} onOpenChange={setRescheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Date</label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Time</label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rescheduling..."
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Rescheduling..." : "Save"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Students Modal */}
      <Dialog open={studentsModal} onOpenChange={setStudentsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Students Enrolled - {selectedGroupSession?.subject}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedGroupSession?.students.map((student, index) => (
              <div key={student.studentId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-400 to-purple-400 flex items-center justify-center text-lg font-bold text-white">
                  {student.studentName[0] || "?"}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{student.studentName}</div>
                  <div className="text-sm text-gray-500">Student #{index + 1}</div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/chat/${student.studentId}`}>Message</Link>
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced grid layout for session cards */}
      <div className="grid gap-12 md:grid-cols-1 lg:grid-cols-2 justify-center" style={{gridAutoColumns:'minmax(380px, 1fr)'}}>
        {groupedSessions.map((session) => {
          const statusColor = session.status === "confirmed"
            ? "bg-green-100 text-green-700"
            : session.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700";

          const isGroupSession = session.sessionType === "group" && session.students.length > 1;
          const displayName = isGroupSession 
            ? `${session.students.length} students enrolled`
            : session.students[0]?.studentName || "Unknown Student";

          return (
            <div
              key={`${session.sessionDate}-${session.sessionTime}-${session.subject}`}
              className="relative rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50/80 via-indigo-100/80 to-purple-100/80 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-slate-700/80 backdrop-blur-xl border border-blue-200/30 p-10 min-h-[340px] min-w-[380px] max-w-[600px] w-full flex flex-col gap-8 transition-transform hover:scale-[1.025] hover:shadow-indigo-300/40 mx-auto"
            >
              {/* Status badge and View Students button */}
              <div className="absolute top-4 right-4 flex gap-2">
                {isGroupSession && (
                  <Button
                    onClick={() => {
                      setSelectedGroupSession(session);
                      setStudentsModal(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/80 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    View Students
                  </Button>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor} shadow-md`}>
                  {session.status}
                </span>
              </div>

              {/* Session info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-400 to-purple-400 shadow-lg border-4 border-white flex items-center justify-center text-3xl font-bold text-white">
                  {isGroupSession ? (
                    <Users className="w-8 h-8" />
                  ) : (
                    session.students[0]?.studentName[0] || "?"
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-900 dark:text-blue-100 drop-shadow-lg">
                      {displayName}
                    </span>
                    <button
                      type="button"
                      className="ml-2 p-1 rounded-lg bg-white/60 hover:bg-blue-100 transition-colors shadow"
                      title="Reschedule Session"
                      onClick={() => {
                        setSelectedSession(session);
                        setNewDate(session.sessionDate);
                        setNewTime(session.sessionTime);
                        setReason("");
                        setRescheduleModal(true);
                      }}
                    >
                      <Pen className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-base text-indigo-700 dark:text-indigo-300 font-medium">
                    <span className="inline-block w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                      {session.subject[0]}
                    </span>
                    <span>{session.subject}</span>
                    {isGroupSession && (
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Group Session
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & time */}
              <div className="flex items-center gap-5 text-lg font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 shadow text-blue-700 dark:text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="4" strokeWidth="2"/>
                    <path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {session.sessionDate && !isNaN(Date.parse(session.sessionDate))
                    ? format(parseISO(session.sessionDate), "MMM d, yyyy")
                    : "Invalid date"}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 shadow text-indigo-700 dark:text-indigo-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path strokeWidth="2" d="M12 6v6l4 2"/>
                  </svg>
                  {session.sessionTime}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 mt-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold shadow-lg rounded-xl px-8 py-3 text-base transition-all hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-purple-600"
                >
                  <Link href={`/session/${session._id}/join`}>Join Session</Link>
                </Button>
                {!isGroupSession && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl px-8 py-3 text-base transition-all hover:bg-indigo-50 hover:scale-105 hover:shadow"
                  >
                    <Link href={`/chat/${session.students[0]?.studentId}`}>Message Student</Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

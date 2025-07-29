"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import { format, parseISO, isBefore } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
// import { useToast } from "../ui/use-toast"; // Uncomment if you have a toast hook

interface Booking {
  _id: string;
  tutorId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
  ratingSubmitted?: boolean;
  dispute?: {
    filed: boolean;
    reason?: string;
    resolved: boolean;
    outcome?: "refunded" | "rejected";
    filedAt?: string;
    resolvedAt?: string;
  };
}

export function PastSessions() {
  const { data: session } = useSession();
  const [pastSessions, setPastSessions] = useState<Booking[]>([]);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [disputeModal, setDisputeModal] = useState<{ open: boolean; bookingId?: string }>({
    open: false,
  });
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  // const { toast } = useToast();

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
    async function fetchPastSessions() {
      if (!session?.user?.id) return;
      setIsLoading(true);
      const res = await fetch(`/api/bookings?studentId=${session.user.id}&status=completed`);
      const data = await res.json();
      setPastSessions(data.bookings || []);
      setIsLoading(false);
    }
    fetchPastSessions();
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchAllTutorNames() {
      const uniqueTutorIds = Array.from(new Set(pastSessions.map((s) => s.tutorId)));
      await Promise.all(uniqueTutorIds.map((id) => fetchTutorName(id)));
    }
    if (pastSessions.length) fetchAllTutorNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastSessions]);

  async function handleRatingSubmit(e: React.FormEvent<HTMLFormElement>, booking: Booking) {
    e.preventDefault();
    setSubmitting(booking._id);
    const form = e.target as HTMLFormElement;
    const score = Number((form.elements.namedItem("score") as HTMLInputElement).value);
    const comment = (form.elements.namedItem("comment") as HTMLTextAreaElement).value;
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: session?.user.id,
        tutorId: booking.tutorId,
        bookingId: booking._id,
        score,
        comment,
      }),
    });
    // toast({ title: "Rating submitted!" });
    setPastSessions((prev) =>
      prev.map((b) => (b._id === booking._id ? { ...b, ratingSubmitted: true } : b))
    );
    setSubmitting(null);
  }

  async function handleDisputeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeModal.bookingId) return;
    setDisputeSubmitting(true);
    const res = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: disputeModal.bookingId, reason: disputeReason }),
    });
    setDisputeSubmitting(false);
    setDisputeModal({ open: false });
    setDisputeReason("");
    if (res.ok) {
      toast.success("Dispute filed successfully.");
      setPastSessions((prev) =>
        prev.map((b) =>
          b._id === disputeModal.bookingId
            ? {
                ...b,
                dispute: {
                  ...b.dispute,
                  filed: true,
                  resolved: b.dispute?.resolved ?? false,
                  reason: b.dispute?.reason ?? disputeReason,
                  filedAt: b.dispute?.filedAt ?? new Date().toISOString(),
                  outcome: b.dispute?.outcome,
                  resolvedAt: b.dispute?.resolvedAt,
                },
              }
            : b
        )
      );
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to file dispute.");
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

  if (!pastSessions.length) {
    return <div className="text-muted-foreground">No past sessions.</div>;
  }

  return (
    <>
      <Dialog open={disputeModal.open} onOpenChange={(open) => setDisputeModal({ open })}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDisputeSubmit} className="flex flex-col gap-4">
            <label className="font-semibold">Why are you reporting this session?</label>
            <textarea
              className="input input-bordered min-h-[120px] resize-y"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              required
              rows={4}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#9CA3AF #F3F4F6'
              }}
            />
            <DialogFooter>
              <Button type="submit" disabled={disputeSubmitting}>
                {disputeSubmitting ? "Submitting..." : "Submit"}
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
      <div className="grid gap-10 md:grid-cols-2">
        {pastSessions.map((session) => {
          const isPast =
            session.sessionDate &&
            !isNaN(Date.parse(session.sessionDate)) &&
            isBefore(parseISO(session.sessionDate), new Date());
          const canDispute = isPast && (!session.dispute || session.dispute.filed === false);
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
                  {tutorNames[session.tutorId]?.[0] || "?"}
                </div>
              </div>

              <CardHeader className="flex flex-col items-center mt-8 pb-2">
                <CardTitle className="text-base text-center font-semibold text-slate-700 group-hover:text-indigo-500 transition-colors duration-300">
                  Tutor: {tutorNames[session.tutorId] || session.tutorId}
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
                {/* Message Button */}
                <Link href={`/chat/${session.tutorId}`} className="w-full mt-2">
                  <Button size="sm" variant="outline" className={`w-full text-indigo-700 border-indigo-300 font-semibold rounded-xl px-4 py-2 transition-all hover:bg-indigo-50 hover:scale-105 hover:shadow`}>
                    Message Tutor
                  </Button>
                </Link>
                {/* Dispute Button */}
                {canDispute && (
                  <Button
                    variant="destructive"
                    className="w-full mt-2 rounded-xl"
                    onClick={() => setDisputeModal({ open: true, bookingId: session._id })}
                  >
                    Report an Issue
                  </Button>
                )}
                {/* Rating Form */}
                {!session.ratingSubmitted && (
                  <form
                    className="flex flex-col gap-2 mt-2 w-full items-center"
                    onSubmit={(e) => handleRatingSubmit(e, session)}
                  >
                    <div className="flex items-center gap-2">
                      <span>⭐</span>
                      <input
                        name="score"
                        type="range"
                        min={1}
                        max={5}
                        defaultValue={5}
                        className="w-32 accent-indigo-500"
                        required
                      />
                      <span className="text-xs text-indigo-500 font-semibold">Rate your session with Tutor</span>
                    </div>
                    <textarea
                      name="comment"
                      className="input input-bordered w-full rounded-xl border-indigo-200 focus:border-indigo-400 focus:ring-indigo-100"
                      placeholder="Leave a comment..."
                    />
                    <Button type="submit" className="w-fit rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-6 py-2 shadow-md hover:scale-105 transition-all duration-300" disabled={!!submitting}>
                      {submitting === session._id ? "Submitting..." : "Submit Rating"}
                    </Button>
                  </form>
                )}
                {/* Rating Submitted Message */}
                {session.ratingSubmitted && (
                  <div className="text-green-600 text-sm mt-2">Thank you for your feedback!</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

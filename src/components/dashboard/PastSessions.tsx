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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDisputeSubmit} className="flex flex-col gap-4">
            <label className="font-semibold">Why are you reporting this session?</label>
            <textarea
              className="input input-bordered"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              required
              rows={4}
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
      <div className="grid gap-6 md:grid-cols-2">
        {pastSessions.map((session) => {
          const isPast =
            session.sessionDate &&
            !isNaN(Date.parse(session.sessionDate)) &&
            isBefore(parseISO(session.sessionDate), new Date());
          const canDispute = isPast && (!session.dispute || session.dispute.filed === false);
          return (
            <Card key={session._id} className="max-w-md w-full mx-auto">
              <CardHeader className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-muted mb-2 flex items-center justify-center text-2xl font-bold text-gray-500">
                  {tutorNames[session.tutorId]?.[0] || "?"}
                </div>
                <CardTitle className="text-lg">
                  Tutor: {tutorNames[session.tutorId] || session.tutorId}
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
                <Link href={`/chat/${session.tutorId}`} className="w-full">
                  <Button size="sm" variant="outline" className="w-full">
                    Message Tutor
                  </Button>
                </Link>
                {canDispute && (
                  <Button
                    variant="destructive"
                    className="w-full mt-2"
                    onClick={() => setDisputeModal({ open: true, bookingId: session._id })}
                  >
                    Report an Issue
                  </Button>
                )}
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
                        className="w-32"
                        required
                      />
                      <span>Rate your session with Tutor</span>
                    </div>
                    <textarea
                      name="comment"
                      className="input input-bordered w-full"
                      placeholder="Leave a comment..."
                    />
                    <Button type="submit" className="w-fit" disabled={!!submitting}>
                      {submitting === session._id ? "Submitting..." : "Submit Rating"}
                    </Button>
                  </form>
                )}
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

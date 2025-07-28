"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO, isWithinInterval, addMinutes } from "date-fns";
import Script from "next/script";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { StarRating } from "@/components/ui/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizCreationCard } from "./QuizCreationCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SessionData {
  _id: string;
  tutorId: string;
  studentId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  tutorName?: string;
  studentName?: string;
  dispute?: {
    filed: boolean;
    reason?: string;
    resolved: boolean;
    outcome?: "refunded" | "rejected";
    filedAt?: string;
    resolvedAt?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankCode?: string;
  };
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JoinSessionPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<boolean | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [jitsiLoading, setJitsiLoading] = useState(true);
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [materialModal, setMaterialModal] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [disputeBankName, setDisputeBankName] = useState("");
  const [disputeBankNumber, setDisputeBankNumber] = useState("");
  const [disputeBankCode, setDisputeBankCode] = useState("");
  const [bankList, setBankList] = useState<{ name: string; code: string }[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState<number | null>(null);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);

  const sessionStart = sessionData
    ? parseISO(`${sessionData.sessionDate}T${sessionData.sessionTime}`)
    : null;
  const now = new Date();
  const sessionHasStarted = sessionStart && now >= sessionStart;
  const sessionHasEnded = sessionStart && now > addMinutes(sessionStart, 60);
  const isTutor = session?.user?.role === "tutor";
  const isStudent = session?.user?.role === "user";

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      const res = await fetch(`/api/bookings?id=${params.id}`);
      const data = await res.json();
      if (!data.booking) {
        setError("Session not found.");
        setLoading(false);
        return;
      }
      // Fetch tutor and student names and emails
      const [tutorRes, studentRes] = await Promise.all([
        fetch(`/api/users?id=${data.booking.tutorId}`),
        fetch(`/api/users?id=${data.booking.studentId}`),
      ]);
      const tutorName = (await tutorRes.json()).user?.name;
      const studentUser = (await studentRes.json()).user;
      setSessionData({ ...data.booking, tutorName, studentName: studentUser?.name });
      setStudentEmail(studentUser?.email || null);
      setLoading(false);
    }
    fetchSession();
  }, [params.id]);

  useEffect(() => {
    if (!sessionData || !session?.user || !jitsiRef.current) return;

    // Access protection
    const isAssigned =
      session.user.id === sessionData.studentId || session.user.id === sessionData.tutorId;

    if (!isAssigned) {
      setError("You are not authorized to join this session.");
      return;
    }

    // Remove confirmation check - sessions are auto-confirmed
  }, [sessionData, session]);

  // Fetch attendance if tutor
  useEffect(() => {
    if (isTutor && sessionData) {
      fetch(
        `/api/attendance?sessionId=${sessionData._id}&studentId=${sessionData.studentId}&tutorId=${sessionData.tutorId}`
      )
        .then((res) => res.json())
        .then((data) => setAttendance(data.attendance?.present ?? null));
    }
  }, [isTutor, sessionData]);

  // Fetch rating if student
  useEffect(() => {
    if (isStudent && sessionData) {
      fetch(`/api/ratings?sessionId=${sessionData._id}&studentId=${sessionData.studentId}`)
        .then((res) => res.json())
        .then((data) => setRatingSubmitted(!!data.ratings?.length));
    }
  }, [isStudent, sessionData]);

  useEffect(() => {
    async function fetchMaterials() {
      if (!sessionData) return;
      const res = await fetch(`/api/materials?sessionId=${sessionData._id}`);
      const data = await res.json();
      setMaterials(data.materials || []);
    }
    fetchMaterials();
  }, [sessionData]);

  useEffect(() => {
    if (!disputeModal) return;
    async function fetchBanks() {
      try {
        const res = await fetch("https://api.chapa.co/v1/banks/ET");
        const data = await res.json();
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          setBankList(data.data.map((b: any) => ({ name: b.name, code: b.code })));
        } else {
          setBankList([
            { name: "Commercial Bank of Ethiopia (CBE)", code: "01" },
            { name: "Awash Bank", code: "02" },
            { name: "Telebirr", code: "telebirr" },
          ]);
        }
      } catch (err) {
        setBankList([
          { name: "Commercial Bank of Ethiopia (CBE)", code: "01" },
          { name: "Awash Bank", code: "02" },
          { name: "Telebirr", code: "telebirr" },
        ]);
      }
    }
    fetchBanks();
  }, [disputeModal]);

  useEffect(() => {
    if (isStudent && sessionData) {
      // Fetch all attendance records for this student/session
      fetch(`/api/attendance?sessionId=${sessionData._id}&studentId=${sessionData.studentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.attendanceRecords)) {
            const total = data.attendanceRecords.length;
            const present = data.attendanceRecords.filter((a: any) => a.present).length;
            setAttendancePercentage(total > 0 ? (present / total) * 100 : 0);
          } else {
            setAttendancePercentage(null);
          }
        });
    }
  }, [isStudent, sessionData]);

  console.log("Jitsi API available?", window?.JitsiMeetExternalAPI);

  async function handleAttendanceToggle(val: boolean) {
    if (!sessionData) return;
    setAttendanceLoading(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionData._id,
        studentId: sessionData.studentId,
        tutorId: sessionData.tutorId,
        present: val,
      }),
    });
    setAttendance(val);
    setAttendanceLoading(false);
    toast.success("Attendance marked");
  }

  async function handleRatingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionData) return;
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionData._id,
        tutorId: sessionData.tutorId,
        studentId: sessionData.studentId,
        score: rating,
        comment,
      }),
    });
    setRatingSubmitted(true);
    toast.success("Thanks for your feedback!");
  }

  async function handleDisputeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionData) return;
    setDisputeSubmitting(true);
    const res = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: sessionData._id,
        reason: disputeReason,
        bankAccountName: disputeBankName,
        bankAccountNumber: disputeBankNumber,
        bankCode: disputeBankCode,
      }),
    });
    setDisputeSubmitting(false);
    setDisputeModal(false);
    setDisputeReason("");
    setDisputeBankName("");
    setDisputeBankNumber("");
    setDisputeBankCode("");
    if (res.ok) {
      toast.success("Dispute filed successfully.");
      setSessionData((prev) =>
        prev
          ? {
              ...prev,
              dispute: {
                ...prev.dispute,
                filed: true,
                reason: disputeReason,
                resolved: false,
                outcome: undefined,
                filedAt: new Date().toISOString(),
                resolvedAt: undefined,
                bankAccountName: disputeBankName,
                bankAccountNumber: disputeBankNumber,
                bankCode: disputeBankCode,
              },
            }
          : prev
      );
    } else {
      const data = await res.json();
      toast.error(data?.error ?? "Failed to file dispute.");
    }
  }

  async function handleMaterialUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!materialFile || !sessionData) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", materialFile as File);
      formData.append("title", materialTitle);
      formData.append("sessionId", sessionData._id);
      const res = await fetch("/api/materials", {
        method: "POST",
        body: formData,
      });
      setUploading(false);
      setMaterialModal(false);
      setMaterialFile(null);
      setMaterialTitle("");
      if (res.ok) {
        toast.success("Material uploaded!");
        // Notify student
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: sessionData.studentId,
            message: `New material added for your session on ${sessionData.sessionDate}.`,
          }),
        });
        // Refresh materials
        const data = await res.json();
        setMaterials((prev: any[]) => [data.material, ...prev]);
      } else {
        toast.error("Failed to upload material");
      }
    } catch (err) {
      setUploading(false);
      toast.error("Error uploading material");
    }
  }

  if (loading)
    return (
      <div className=" ">
        <div
          className="flex flex-col items-center justify-center p-8 text-center h-[60vh]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          {/* Accessible spinner */}
          <svg
            className="animate-spin h-8 w-8 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="sr-only">LOADING...</span>
          <span aria-hidden="true">LOADING...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-auto">
          <CardHeader>
            <CardTitle>Session Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-red-600">{error}</div>
            <Button onClick={() => {
              if (session?.user?.role === "tutor") {
                router.push("/tutor");
              } else {
                router.push("/student");
              }
            }}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  if (!sessionData) return null;

  return (
    <>
      <Dialog open={disputeModal} onOpenChange={setDisputeModal}>
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
            <label className="font-semibold">Bank Account Name</label>
            <input
              className="input input-bordered"
              value={disputeBankName}
              onChange={(e) => setDisputeBankName(e.target.value)}
              required
            />
            <label className="font-semibold">Bank Account Number</label>
            <input
              className="input input-bordered"
              value={disputeBankNumber}
              onChange={(e) => setDisputeBankNumber(e.target.value)}
              required
            />
            <label className="font-semibold">Bank Code</label>
            <select
              className="input input-bordered"
              value={disputeBankCode}
              onChange={(e) => setDisputeBankCode(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a bank
              </option>
              {bankList.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name} ({bank.code})
                </option>
              ))}
            </select>
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
      {/* Material Upload Modal */}
      <Dialog open={materialModal} onOpenChange={setMaterialModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Material (PDF)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMaterialUpload} className="flex flex-col gap-4">
            <Label htmlFor="material-title">Title (optional)</Label>
            <Input
              id="material-title"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="Material title"
            />
            <Label htmlFor="material-file">PDF File</Label>
            <Input
              id="material-file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
              required
            />
            <DialogFooter>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
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
      <Script
        src="https://meet.jit.si/external_api.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (
            typeof window !== "undefined" &&
            window.JitsiMeetExternalAPI &&
            jitsiRef.current &&
            sessionData &&
            session?.user
          ) {
            console.log("✅ Jitsi API is ready, initializing");

            const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
              roomName: `session-${sessionData._id}`,
              parentNode: jitsiRef.current,
              userInfo: {
                displayName: session.user.name,
                email: session.user.email,
              },
              configOverwrite: {
                startWithAudioMuted: true,
              },
              interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
              },
            });

            // Optional cleanup if needed
            window.addEventListener("beforeunload", () => api.dispose());
          }
          setJitsiLoading(false);
        }}
      />

      <div className="flex flex-col md:flex-row min-h-[80vh]">
        {/* Jitsi Video */}
        <div className="flex-1 bg-black flex items-center justify-center h-fit">
          {jitsiLoading && <Skeleton className="w-full h-[400px] md:h-[80vh]" />}
          <div
            ref={jitsiRef}
            className={`w-full h-[400px] md:h-[80vh] ${jitsiLoading ? "hidden" : ""}`}
          />
        </div>
        {/* Info Panel */}
        <div className="w-full md:w-[400px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <Card className="m-6">
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <span className="font-semibold">Tutor:</span> {sessionData.tutorName}
              </div>
              <div>
                <span className="font-semibold">Student:</span> {sessionData.studentName}
                {studentEmail && (
                  <span className="block text-xs text-gray-500">{studentEmail}</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Date:</span>{" "}
                {format(parseISO(sessionData.sessionDate), "MMM d, yyyy")}
              </div>
              <div>
                <span className="font-semibold">Time:</span> {sessionData.sessionTime}
              </div>
              <div>
                <span className="font-semibold">Subject:</span> {sessionData.subject}
              </div>
              <Button
                onClick={async () => {
                  // Mark session as completed (move to past)
                  await fetch("/api/bookings/complete", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bookingId: sessionData._id }),
                  });
                  if (isTutor) {
                    router.push("/tutor");
                  } else {
                    router.push("/student");
                  }
                }}
                variant="destructive"
              >
                Leave Session
              </Button>
              {isTutor && (
                <QuizCreationCard sessionId={sessionData._id} tutorId={sessionData.tutorId} />
              )}
              {isTutor && (
                <Button onClick={() => setMaterialModal(true)} variant="secondary">
                  Upload Material
                </Button>
              )}
              {isTutor && (
                <div className="flex items-center gap-4 mt-4">
                  <span className="font-semibold">Mark Student as Present</span>
                  <Switch
                    checked={!!attendance}
                    disabled={attendanceLoading}
                    onCheckedChange={handleAttendanceToggle}
                  />
                </div>
              )}
              {isStudent && !ratingSubmitted && (
                <form className="flex flex-col gap-2 mt-4" onSubmit={handleRatingSubmit}>
                  <label className="font-semibold">Rate your session</label>
                  <StarRating value={rating} onChange={setRating} disabled={ratingSubmitted} />
                  <textarea
                    className="input input-bordered"
                    placeholder="Leave a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button type="submit" className="w-fit">
                    Submit Rating
                  </Button>
                </form>
              )}
              {isStudent && ratingSubmitted && (
                <div className="text-green-600 text-sm mt-4">Thanks for your feedback!</div>
              )}
              {isStudent &&
                // sessionHasEnded &&
                (!sessionData.dispute || sessionData.dispute.filed === false) && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setDisputeModal(true)}
                  >
                    Report an Issue
                  </Button>
                )}
              {isStudent && sessionHasEnded && sessionData.dispute?.filed && (
                <div className="text-yellow-600 text-sm mt-2">
                  Dispute already filed for this session.
                </div>
              )}
              {/* Materials List */}
              {materials.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold mb-2">Materials</div>
                  <ul className="space-y-2">
                    {materials.map((mat) => (
                      <li key={mat._id} className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]" title={mat.title || mat.fileUrl}>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO, addMinutes } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  
  // Session state
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Attendance state
  const [attendance, setAttendance] = useState<boolean | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendancePercentage, setAttendancePercentage] = useState<number | null>(null);
  
  // Rating state
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  
  // Jitsi state
  const [jitsiLoading, setJitsiLoading] = useState(true);
  
  // Dispute state
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputePriceAmount, setDisputePriceAmount] = useState("");
  const [disputeBankNumber, setDisputeBankNumber] = useState("");
  const [disputeBankCode, setDisputeBankCode] = useState("");
  const [disputePhoneNumber, setDisputePhoneNumber] = useState("");
  
  // Material state
  const [materialModal, setMaterialModal] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  
  // Validation state
  const [bankList, setBankList] = useState<{ name: string; code: string }[]>([]);
  const [priceAmountError, setPriceAmountError] = useState<string>("");
  const [bankNumberError, setBankNumberError] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [showPhoneTooltip, setShowPhoneTooltip] = useState(false);
  const [showBankTooltip, setShowBankTooltip] = useState(false);
  
  // Other state
  const [studentEmail, setStudentEmail] = useState<string | null>(null);

  const isTutor = (session?.user as any)?.role === "tutor";
  const isStudent = (session?.user as any)?.role === "user";

  // Calculate session timing
  const now = new Date();
  const sessionStart = sessionData?.sessionDate && sessionData?.sessionTime
    ? parseISO(`${sessionData.sessionDate}T${sessionData.sessionTime}`)
    : null;
  const sessionHasEnded = sessionStart && now > addMinutes(sessionStart, 60);

  // Validation functions
  const validatePriceAmount = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) {
      setPriceAmountError("Only numeric values are allowed");
      return false;
    }
    setPriceAmountError("");
    return true;
  };

  const validateBankNumber = (value: string) => {
    if (!/^\d*$/.test(value)) {
      setBankNumberError("Letters and symbols are not allowed in this field");
      return false;
    }
    if (value.length > 13) {
      setBankNumberError("Bank account number cannot exceed 13 digits");
      return false;
    }
    setBankNumberError("");
    return true;
  };

  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^(\+251|0)?[79]\d{8}$/;
    if (!phoneRegex.test(value)) {
      setPhoneNumberError("Please enter a valid Ethiopian phone number");
      return false;
    }
    setPhoneNumberError("");
    return true;
  };

  // Tooltip functions
  const showPhoneInvalidTooltip = () => {
    setShowPhoneTooltip(true);
    setTimeout(() => setShowPhoneTooltip(false), 3000);
  };

  const showBankInvalidTooltip = () => {
    setShowBankTooltip(true);
    setTimeout(() => setShowBankTooltip(false), 3000);
  };

  // Fetch session data
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

  // Access protection
  useEffect(() => {
    if (!sessionData || !session?.user || !jitsiRef.current) return;

    const isAssigned =
      session.user.id === sessionData.studentId || session.user.id === sessionData.tutorId;

    if (!isAssigned) {
      setError("You are not authorized to join this session.");
      return;
    }
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

  // Fetch materials
  useEffect(() => {
    async function fetchMaterials() {
      if (!sessionData) return;
      const res = await fetch(`/api/materials?sessionId=${sessionData._id}`);
      const data = await res.json();
      setMaterials(data.materials || []);
    }
    fetchMaterials();
  }, [sessionData]);

  // Fetch banks for dispute modal
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

  // Fetch attendance percentage for student
  useEffect(() => {
    if (isStudent && sessionData) {
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

  // Event handlers
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
    
    // Validate all fields
    const isPriceValid = validatePriceAmount(disputePriceAmount);
    const isBankValid = validateBankNumber(disputeBankNumber);
    const isPhoneValid = validatePhoneNumber(disputePhoneNumber);
    
    if (!isPriceValid || !isBankValid || !isPhoneValid) {
      return;
    }
    
    setDisputeSubmitting(true);
    const res = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: sessionData._id,
        reason: disputeReason,
        priceAmountPaid: disputePriceAmount,
        bankAccountNumber: disputeBankNumber,
        bankCode: disputeBankCode,
        phoneNumber: disputePhoneNumber,
      }),
    });
    setDisputeSubmitting(false);
    setDisputeModal(false);
    setDisputeReason("");
    setDisputePriceAmount("");
    setDisputeBankNumber("");
    setDisputeBankCode("");
    setDisputePhoneNumber("");
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
                priceAmountPaid: disputePriceAmount,
                bankAccountNumber: disputeBankNumber,
                bankCode: disputeBankCode,
                phoneNumber: disputePhoneNumber,
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

  if (loading) return <Skeleton className="w-full h-[80vh]" />;

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
      {/* Dispute Modal */}
      <Dialog open={disputeModal} onOpenChange={setDisputeModal}>
        <DialogContent className="max-w-lg mx-auto p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Report an Issue
              </DialogTitle>
              <p className="text-red-100 text-sm mt-2 font-medium">
                Help us resolve your concern quickly and efficiently
              </p>
            </DialogHeader>
          </div>

          {/* Form Section */}
          <div className="px-8 py-6">
            <form onSubmit={handleDisputeSubmit} className="space-y-6">
              {/* Issue Description */}
              <div className="space-y-3">
                <Label htmlFor="dispute-reason" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Describe the Issue
                </Label>
                <div className="relative">
                  <textarea
                    id="dispute-reason"
                    className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-sm"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                    rows={4}
                    placeholder="Please provide detailed information about the issue you experienced during this session..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {disputeReason.length}/500
                  </div>
                </div>
              </div>

              {/* Price Amount */}
              <div className="space-y-3">
                <Label htmlFor="price-amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Amount Paid
                </Label>
                <div className="relative">
                  <Input
                    id="price-amount"
                    type="text"
                    value={disputePriceAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDisputePriceAmount(value);
                      validatePriceAmount(value);
                    }}
                    className={`pl-4 pr-16 py-3 border-2 rounded-xl transition-all duration-200 shadow-sm ${
                      priceAmountError 
                        ? "border-red-500 focus:ring-red-500" 
                        : "border-gray-200 dark:border-gray-600 focus:ring-red-500 focus:border-transparent"
                    } bg-white dark:bg-gray-800`}
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">birr</span>
                  </div>
                </div>
                {priceAmountError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {priceAmountError}
                  </div>
                )}
              </div>

              {/* Bank Account Number */}
              <div className="space-y-3">
                <Label htmlFor="bank-number" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Bank Account Number
                </Label>
                <div className="relative">
                  <Input
                    id="bank-number"
                    type="text"
                    value={disputeBankNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 13) {
                        setDisputeBankNumber(value);
                        validateBankNumber(value);
                        if (showBankTooltip) {
                          setShowBankTooltip(false);
                        }
                      } else if (!/^\d*$/.test(value)) {
                        // Show error for invalid characters
                        setBankNumberError("Letters and symbols are not allowed in this field");
                      }
                    }}
                    onKeyPress={(e) => {
                      if (!/\d/.test(e.key)) {
                        e.preventDefault();
                        setBankNumberError("Letters and symbols are not allowed in this field");
                      }
                      if (disputeBankNumber.length >= 13) {
                        e.preventDefault();
                        showBankInvalidTooltip();
                      }
                    }}
                    className={bankNumberError ? "border-red-500" : ""}
                    placeholder="Enter 13-digit account number"
                    maxLength={13}
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {disputeBankNumber.length}/13
                  </div>
                  {showBankTooltip && (
                    <div className="absolute top-full left-0 mt-2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
                      Maximum number allowed is 13 digits
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </div>
                {bankNumberError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {bankNumberError}
                  </div>
                )}
              </div>

              {/* Bank Selection */}
              <div className="space-y-3">
                <Label htmlFor="bank-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Select Your Bank
                </Label>
                <Select value={disputeBankCode} onValueChange={setDisputeBankCode} required>
                  <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Choose your bank from the list" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-xl">
                    {bankList.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code} className="py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-3">
                <Label htmlFor="phone-number" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone-number"
                    type="tel"
                    value={disputePhoneNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[\d+]*$/.test(value)) {
                        setDisputePhoneNumber(value);
                        validatePhoneNumber(value);
                        if (showPhoneTooltip) {
                          setShowPhoneTooltip(false);
                        }
                      }
                    }}
                    onKeyPress={(e) => {
                      if (!/[\d+]/.test(e.key)) {
                        e.preventDefault();
                        showPhoneInvalidTooltip();
                      }
                    }}
                    className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 shadow-sm ${
                      phoneNumberError 
                        ? "border-red-500 focus:ring-red-500" 
                        : "border-gray-200 dark:border-gray-600 focus:ring-orange-500 focus:border-transparent"
                    } bg-white dark:bg-gray-800`}
                    placeholder="0912345678 or +251912345678"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  {showPhoneTooltip && (
                    <div className="absolute top-full left-0 mt-2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
                      Letters and symbols except + are not allowed in this field
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </div>
                {phoneNumberError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {phoneNumberError}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-3 px-6 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={disputeSubmitting} 
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {disputeSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </div>
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

      {/* Jitsi Script */}
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

            window.addEventListener("beforeunload", () => api.dispose());
          }
          setJitsiLoading(false);
        }}
      />

      {/* Main Content */}
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
                  if (session?.user?.role === "tutor") {
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

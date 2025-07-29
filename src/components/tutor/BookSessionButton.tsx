"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

interface Tutor {
  _id: string;
  name: string;
  price?: number;
  subjects?: string[];
}

export default function BookSessionButton({ tutor, price }: { tutor: Tutor; price: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [subject, setSubject] = useState(tutor.subjects?.[0] || "");
  const [message, setMessage] = useState("");
  const [sessionType, setSessionType] = useState<"individual" | "group">("individual");
  const [duration, setDuration] = useState(1);
  const [tutorBookingStatus, setTutorBookingStatus] = useState<{
    hasIndividualBooking: boolean;
    hasGroupBooking: boolean;
    groupBookings: any[];
    individualBooking?: any;
  }>({ hasIndividualBooking: false, hasGroupBooking: false, groupBookings: [] });
  const [availability, setAvailability] = useState<any>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurringStartDate, setRecurringStartDate] = useState("");
  const [recurringDuration, setRecurringDuration] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(price);
  const toastShownRef = useRef(false);

  // Group + individual not allowed, group + group allowed
  // If group session exists, allow only group booking, not individual
  // If individual session exists, allow neither
  const hasGroupBooking = tutorBookingStatus.hasGroupBooking;
  const hasIndividualBooking = tutorBookingStatus.hasIndividualBooking;
  const canBookIndividual = !hasIndividualBooking && !hasGroupBooking;
  const canBookGroup = hasGroupBooking && !hasIndividualBooking;
  const hasActiveGroupSessions = tutorBookingStatus.groupBookings.length > 0;

  useEffect(() => {
    async function fetchAvailability() {
      if (tutor._id) {
        const res = await fetch(`/api/tutors/${tutor._id}`);
        const data = await res.json();
        setAvailability(data.tutor?.availability || null);
      }
    }
    fetchAvailability();
  }, [tutor._id]);

  useEffect(() => {
    async function checkTutorBookingStatus() {
      try {
        const res = await axios.get(`/api/bookings/tutor-status/${tutor._id}`);
        setTutorBookingStatus(res.data);
      } catch (error) {
        console.error("Failed to check tutor booking status:", error);
      }
    }

    if (tutor._id) {
      checkTutorBookingStatus();
    }
  }, [tutor._id]);

  useEffect(() => {
    if (open && !canBookIndividual && !toastShownRef.current) {
      toast.error(
        "This tutor is already booked for an individual session at the selected time."
      );
      toastShownRef.current = true;
    }
    if (!open) {
      toastShownRef.current = false;
    }
  }, [open, canBookIndividual]);

  function isTimeInRange(day: string, time: string) {
    // Always return true to allow any time input
    return true;
  }

  // Compute available slots from tutor availability
  const availableSlots = availability
    ? Object.entries(availability)
        .filter(([, v]: any) => v.available && v.from)
        .map(([day, v]: any) => {
          let from = v.from;
          let to = v.to || "23:59";

          // Ensure proper time format
          if (/^\d{1,2}$/.test(from)) from = from.padStart(2, "0") + ":00";
          if (/^\d{1,2}$/.test(to)) to = to.padStart(2, "0") + ":00";

          const timeLabel = from > to ? `${from} - ${to} (next day)` : `${from} - ${to}`;

          return {
            value: `${day}:${from}`,
            label: `Every ${day.charAt(0).toUpperCase() + day.slice(1)}: ${timeLabel}`,
            day,
            time: from,
          };
        })
    : [];

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    console.log("Form submitted");

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!sessionDate || !selectedSlot) {
      toast.error("Session date and time slot are required.");
      return;
    }

    if (!subject) {
      toast.error("Subject is required.");
      return;
    }

    console.log("Booking data:", { sessionDate, selectedSlot, subject, sessionType });

    setLoading(true);
    try {
      const [day, time] = selectedSlot.split(":");

      // Calculate total price for Chapa and payment record
      const calculatedTotal = price * duration * 4;

      // Create single booking
      const bookingResponse = await axios.post("/api/bookings", {
        tutorId: tutor._id,
        studentId: session.user.id,
        price: calculatedTotal,
        sessionDate,
        sessionTime: time,
        subject,
        message,
        sessionType,
        weeklySlot: day,
      });

      console.log("Booking created:", bookingResponse.data);
      const booking = bookingResponse.data.booking;

      // Create payment record
      const tx_ref = `booking-${booking._id}-${Date.now()}`;
      await axios.post("/api/payments", {
        bookingId: booking._id,
        studentId: session.user.id,
        tutorId: tutor._id,
        amount: calculatedTotal,
        tx_ref,
      });

      // Initialize payment
      const paymentInitRes = await axios.post("/api/payments/init", {
        amount: calculatedTotal,
        email: session.user.email,
        first_name: session.user.name?.split(" ")[0] || "Student",
        last_name: session.user.name?.split(" ").slice(1).join(" ") || "",
        tx_ref,
        callback_url: `${window.location.origin}/api/webhook/chapa`,
        return_url: `${window.location.origin}/payment-status?booking=${booking._id}`,
      });

      console.log("Payment initialized:", paymentInitRes.data);
      window.location.href = paymentInitRes.data.checkout_url;
    } catch (err: any) {
      console.error("Booking error:", err);
      // Show a more user-friendly error message for known booking errors
      const errorMsg = err.response?.data?.error || "Failed to start payment. Please try again.";
      if (errorMsg.includes("already booked for this slot")) {
        toast.error(
          "This tutor is already booked for this time slot. Please choose another time or try a group session if available."
        );
      } else if (errorMsg.includes("already booked for an individual session")) {
        toast.error(
          "This tutor is already booked for an individual session at this time. Please choose another slot or try a group session."
        );
      } else if (errorMsg.includes("Group session is full")) {
        toast.error(
          "This group session is already full. Please choose another slot or try again later."
        );
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRecurringBook(e: React.FormEvent) {
    e.preventDefault();
    setAvailabilityError("");
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (!startDate || selectedSlots.length === 0 || !subject) {
      setAvailabilityError("Please select at least one time slot and fill all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      // Extract weekdays and times from selected slots
      const weekdays = selectedSlots.map(slot => slot.split(":")[0]);
      const time = selectedSlots[0].split(":")[1]; // Use first selected time
      
      // 1. Create recurring sessions
      const res = await axios.post("/api/bookings/recurring", {
        tutorId: tutor._id,
        studentId: session.user.id,
        startDate,
        durationInMonths: recurringDuration,
        weekdays,
        time,
        subject,
        message,
      });
      
      const { tutorName, firstSessionDate, sessions, totalSessions, totalPayment } = res.data;
      
      if (!sessions || !sessions.length) throw new Error("No sessions created");
      
      // Show success message with details
      toast.success(
        `Successfully scheduled ${totalSessions} recurring sessions! Total cost: ${totalPayment} ETB`
      );
      
      // 2. Create payment record
      const tx_ref = `recurring-${sessions[0]._id}-${Date.now()}`;
      await axios.post("/api/payments", {
        bookingId: sessions[0]._id,
        studentId: session.user.id,
        tutorId: tutor._id,
        amount: totalPayment,
        tx_ref,
      });
      
      // 3. Initiate payment
      const paymentInitRes = await axios.post("/api/payments/init", {
        amount: totalPayment,
        email: session.user.email,
        first_name: session.user.name?.split(" ")[0] || "Student",
        last_name: session.user.name?.split(" ").slice(1).join(" ") || "",
        tx_ref,
        callback_url: `${window.location.origin}/api/webhook/chapa`,
        return_url: `${window.location.origin}/payment-status?booking=${sessions[0]._id}`,
      });
      
      window.location.href = paymentInitRes.data.checkout_url;
    } catch (err: any) {
      console.error("Recurring booking error:", err);
      const errorMsg = err.response?.data?.error || "Failed to book recurring sessions. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      {canBookIndividual && (
        <Button
          className="mt-4 w-full font-semibold shadow-lg mb-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          onClick={() => setOpen(true)}
        >
          Book a session for {price} birr
        </Button>
      )}
      {hasIndividualBooking && (
        <div className="mt-4 space-y-2">
          <div className="w-full bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-center font-semibold">
            Individual Session - BOOKED
            {tutorBookingStatus.individualBooking && (
              <div className="text-xs mt-1">
                Date: {tutorBookingStatus.individualBooking.sessionDate}
                {tutorBookingStatus.individualBooking.sessionTime && tutorBookingStatus.individualBooking.sessionTime !== "00" && (
                  <> at {tutorBookingStatus.individualBooking.sessionTime}</>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {canBookGroup && (
        <Button
          className="mt-4 w-full font-semibold shadow-lg mb-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          onClick={() => {
            setSessionType("group");
            setOpen(true);
          }}
        >
          Book Group Session for {price} birr
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-lg w-full max-h-[85vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 backdrop-blur-xl"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
        >
          <DialogHeader className="px-8 pt-8 pb-2">
            <DialogTitle className="text-2xl font-extrabold text-center tracking-tight drop-shadow-md flex items-center justify-center gap-2">
              <span role="img" aria-label="calendar" className="text-blue-600 dark:text-blue-300">📅</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Book a Session</span>
            </DialogTitle>
          </DialogHeader>
          {/* Show explanation if user cannot book individual or group session */}
          {!canBookIndividual && (
            <div className="mb-4 mx-8 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-center text-sm font-medium shadow-sm">
              {hasIndividualBooking
                ? "This tutor is already booked for an individual session at the selected time."
                : hasGroupBooking
                ? "This tutor is already booked for a group session at the selected time. Only group bookings are allowed."
                : null}
            </div>
          )}
          <form onSubmit={handleBook} className="flex flex-col gap-6 px-8 pb-8 pt-2">
            {canBookIndividual && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Session Type</label>
                <div className="relative group">
                  <select
                    className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-semibold shadow-lg appearance-none pr-12 text-blue-900 dark:text-blue-100"
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as 'individual' | 'group')}
                  >
                    <option value="individual" className="font-bold">Individual Session</option>
                    <option value="group" className="font-bold">Group Session</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 transition-transform duration-300 group-focus-within:rotate-180">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
            )}
            {canBookGroup && <input type="hidden" value="group" />}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Session Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-medium shadow-sm"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Available Time Slots</label>
              <div className="relative group">
                <select
                  className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-semibold shadow-lg appearance-none pr-12 text-blue-900 dark:text-blue-100"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  required
                >
                  <option value="" className="font-bold text-gray-400">Select a time slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.value} value={slot.value} className={selectedSlot === slot.value ? 'font-bold text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-900' : ''}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 transition-transform duration-300 group-focus-within:rotate-180">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
              {availableSlots.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No availability set by tutor</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Subject</label>
              <div className="relative group">
                <select
                  className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-semibold shadow-lg appearance-none pr-12 text-blue-900 dark:text-blue-100"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  <option value="" className="font-bold text-gray-400">Select a subject</option>
                  {tutor.subjects?.map((subj) => (
                    <option key={subj} value={subj} className={subject === subj ? 'font-bold text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-900' : ''}>
                      {subj}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 transition-transform duration-300 group-focus-within:rotate-180">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Message <span className="font-normal text-gray-400">(Optional)</span></label>
              <textarea
                className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-medium shadow-sm h-24 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any special requirements or notes..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Duration <span className="font-normal text-gray-400">(Months)</span></label>
              <select
                className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-medium shadow-sm"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={1}>1 Month</option>
                <option value={2}>2 Months</option>
                <option value={3}>3 Months</option>
                <option value={4}>4 Months</option>
                <option value={5}>5 Months</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full font-bold shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-400 focus:outline-none py-3 text-lg tracking-tight disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Book ${sessionType} Session - ${price * duration * 4} birr`
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}



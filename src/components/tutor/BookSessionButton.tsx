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

  const canBookIndividual = !tutorBookingStatus.hasIndividualBooking;
  const canBookGroup = true; // Always allow group booking
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
        "This tutor is already booked for an individual session at the selected time. You can only join a group session if available."
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

      // Create single booking
      const bookingResponse = await axios.post("/api/bookings", {
        tutorId: tutor._id,
        studentId: session.user.id,
        price,
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
        amount: price,
        tx_ref,
      });

      // Initialize payment
      const paymentInitRes = await axios.post("/api/payments/init", {
        amount: price,
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
    if (!startDate || !selectedSlot || !subject) {
      setAvailabilityError("All fields except message are required.");
      return;
    }
    setLoading(true);
    try {
      let [weekday, timeRaw] = selectedSlot.split(":");
      let time = timeRaw.length === 2 ? timeRaw.padStart(2, "0") + ":00" : timeRaw;
      // 1. Create recurring sessions
      const res = await axios.post("/api/bookings/recurring", {
        tutorId: tutor._id,
        studentId: session.user.id,
        startDate,
        durationInMonths: duration,
        weekday,
        time,
        subject,
        message,
      });
      const { tutorName, firstSessionDate, sessions } = res.data;
      if (!sessions || !sessions.length) throw new Error("No sessions created");
      // 2. Calculate total price
      const totalAmount = (tutor.price ?? price) * sessions.length;
      // 3. Create payment record
      const tx_ref = `recurring-${sessions[0]._id}-${Date.now()}`;
      await axios.post("/api/payments", {
        bookingId: sessions[0]._id, // Use first session as reference
        studentId: session.user.id,
        tutorId: tutor._id,
        amount: totalAmount,
        tx_ref,
      });
      // 4. Initiate payment (Chapa)
      const paymentInitRes = await axios.post("/api/payments/init", {
        amount: totalAmount,
        email: session.user.email,
        first_name: session.user.name?.split(" ")[0] || "Student",
        last_name: session.user.name?.split(" ").slice(1).join(" ") || "",
        tx_ref,
        callback_url: `${window.location.origin}/api/webhook/chapa`,
        return_url: `${window.location.origin}/payment-status?booking=${sessions[0]._id}`,
      });
      window.location.href = paymentInitRes.data.checkout_url;
    } catch (err) {
      alert("Failed to book recurring sessions or start payment. Please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      {canBookIndividual ? (
        <Button className="mt-4 w-full font-semibold shadow mb-0" onClick={() => setOpen(true)}>
          Book a session for {price} birr
        </Button>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="w-full bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-center font-semibold">
            Individual Session - BOOKED
            {tutorBookingStatus.individualBooking && (
              <div className="text-xs mt-1">
                Date: {tutorBookingStatus.individualBooking.sessionDate} at{" "}
                {tutorBookingStatus.individualBooking.sessionTime}
              </div>
            )}
          </div>
          {canBookGroup && (
            <Button
              className="w-full font-semibold shadow bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setSessionType("group");
                setOpen(true);
              }}
            >
              Book Group Session for {price} birr
            </Button>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">📅 Book Session</DialogTitle>
          </DialogHeader>
          {/* Show explanation if user cannot book individual or group session */}
          {!canBookIndividual && (
            <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded text-center text-sm">
              This tutor is already booked for an individual session at the selected time. You can
              only join a group session if available.
            </div>
          )}
          {/* Optionally, add more explanations for group session full, etc. */}
          <form onSubmit={handleBook} className="space-y-4 mt-4">
            {canBookIndividual && (
              <div>
                <label className="block text-sm font-medium mb-1">Session Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as "individual" | "group")}
                >
                  <option value="individual">Individual Session</option>
                  <option value="group">Group Session</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Session Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Available Time Slots</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                required
              >
                <option value="">Select a time slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {availableSlots.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">No availability set by tutor</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="">Select a subject</option>
                {tutor.subjects?.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any special requirements or notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration (Months)</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <Button type="submit" disabled={loading || !selectedSlot} className="w-full">
              {loading ? "Processing..." : `Book ${sessionType} Session - ${price} birr`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

const handleSlotChange = (slotValue: string, checked: boolean) => {
  let newSelectedSlots;
  if (checked) {
    newSelectedSlots = [...selectedSlots, slotValue];
  } else {
    newSelectedSlots = selectedSlots.filter((slot) => slot !== slotValue);
  }

  setSelectedSlots(newSelectedSlots);
  setTotalPrice(price * newSelectedSlots.length);

  // Set session time from first selected slot for backward compatibility
  if (newSelectedSlots.length > 0) {
    const [, time] = newSelectedSlots[0].split(":");
    setSessionTime(time);
  }
};

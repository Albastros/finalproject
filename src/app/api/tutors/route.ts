import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import Rating from "@/models/rating";
import Booking from "@/models/booking";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const query: any = { role: "tutor", isVerified: true };

  // Keyword search (name, bio)
  const keyword = searchParams.get("keyword");
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { bio: { $regex: keyword, $options: "i" } },
    ];
  }

  // Subject filter
  const subject = searchParams.get("subject");
  if (subject && subject !== "none") query.subjects = subject;

  // Language filter
  const language = searchParams.get("language");
  if (language && language !== "none") query.languages = language;

  // Experience filter
  const experience = searchParams.get("experience");
  if (experience) query.experience = { $gte: Number(experience) };

  // Gender filter
  const gender = searchParams.get("gender");
  if (gender && gender !== "none") query.gender = gender;

  // Hourly rate filter
  const minRate = searchParams.get("minRate");
  const maxRate = searchParams.get("maxRate");
  if (minRate || maxRate) {
    query.price = {};
    if (minRate) query.price.$gte = Number(minRate);
    if (maxRate) query.price.$lte = Number(maxRate);
  }

  // Store availability filter for later processing (after booking status calculation)
  const availabilityFilter = searchParams.get("availability");

  // Tutoring type filter
  const tutoringType = searchParams.get("tutoringType");
  if (tutoringType && tutoringType !== "none") query.tutoringType = tutoringType;

  // Find tutors
  let tutors = await User.find(query).lean();

  // Add booking status logic for availability
  const tutorsWithBookingStatus = await Promise.all(
    tutors.map(async (tutor) => {
      const tutorId = (tutor._id as any).toString();
      
      // Get all confirmed bookings for this tutor
      const bookings = await Booking.find({
        tutorId,
        status: "confirmed"
      }).lean();
      
      // Separate individual and group bookings
      const individualBookings = bookings.filter(b => b.sessionType === "individual");
      const groupBookings = bookings.filter(b => b.sessionType === "group");
      
      let availabilityStatus = "available";
      let isFullyBookedIndividually = false;
      
      // Check if tutor has availability schedule defined
      const availability = tutor.availability || {};
      const hasAvailabilitySchedule = Object.keys(availability).some(day => 
        availability[day]?.available
      );
      
      // If tutor has no availability schedule, they remain available
      if (!hasAvailabilitySchedule) {
        return {
          ...tutor,
          availabilityStatus: "available",
          isFullyBookedIndividually: false,
          hasIndividualBookings: individualBookings.length > 0,
          hasGroupBookings: groupBookings.length > 0
        };
      }
      
      // Get all available time slots from tutor's schedule
      // This matches the actual booking system which uses day:time format with only the 'from' time
      const availableTimeSlots: string[] = [];
      
      Object.keys(availability).forEach(day => {
        if (availability[day]?.available && availability[day]?.from) {
          let fromTime = availability[day].from;
          
          // Ensure proper time format (same logic as BookSessionButton)
          if (/^\d{1,2}$/.test(fromTime)) {
            fromTime = fromTime.padStart(2, '0') + ':00';
          }
          
          // The booking system uses day:time format, not day-time
          availableTimeSlots.push(`${day}:${fromTime}`);
        }
      });
      
      // If no time slots are available, tutor is available (no restrictions)
      if (availableTimeSlots.length === 0) {
        return {
          ...tutor,
          availabilityStatus: "available",
          isFullyBookedIndividually: false,
          hasIndividualBookings: individualBookings.length > 0,
          hasGroupBookings: groupBookings.length > 0
        };
      }
      
      // Get confirmed booked time slots
      const bookedTimeSlots = individualBookings.map(booking => {
        const bookingDate = new Date(booking.sessionDate);
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[bookingDate.getDay()];
        
        // Match the format used in BookSessionButton: day:time
        return `${dayOfWeek}:${booking.sessionTime}`;
      });
      
      // Check if all available slots are booked
      const unbookedSlots = availableTimeSlots.filter(slot => 
        !bookedTimeSlots.includes(slot)
      );
      
      // Debug logging
      console.log(`\n=== Tutor ${tutorId} (${(tutor as any).name}) ===`);
      console.log(`Available slots: [${availableTimeSlots.join(', ')}]`);
      console.log(`Booked slots: [${bookedTimeSlots.join(', ')}]`);
      console.log(`Unbooked slots: [${unbookedSlots.join(', ')}]`);
      console.log(`Individual bookings count: ${individualBookings.length}`);
      
      // If no unbooked slots remain, mark as unavailable
      if (availableTimeSlots.length > 0 && unbookedSlots.length === 0) {
        availabilityStatus = "unavailable";
        isFullyBookedIndividually = true;
        console.log(`✗ Marked as UNAVAILABLE (all slots booked)`);
      } else {
        console.log(`✓ Marked as AVAILABLE (${unbookedSlots.length}/${availableTimeSlots.length} slots free)`);
      }
      
      return {
        ...tutor,
        availabilityStatus,
        isFullyBookedIndividually,
        hasIndividualBookings: individualBookings.length > 0,
        hasGroupBookings: groupBookings.length > 0
      };
    })
  );
  
  tutors = tutorsWithBookingStatus;

  // Apply availability filter based on booking status
  if (availabilityFilter) {
    if (availabilityFilter === "available") {
      tutors = tutors.filter(tutor => tutor.availabilityStatus === "available");
    } else if (availabilityFilter === "unavailable") {
      tutors = tutors.filter(tutor => tutor.availabilityStatus === "unavailable");
    } else if (availabilityFilter === "now") {
      // Keep original logic for "now" - tutors with any available day
      tutors = tutors.filter(tutor => {
        const availability = tutor.availability || {};
        return Object.keys(availability).some(day => availability[day]?.available);
      });
    }
  }

  // Rating filter (aggregate from Rating model)
  const rating = searchParams.get("rating");
  if (rating && tutors.length > 0) {
    const tutorIds = tutors.map((t) =>
      typeof (t as any)._id === "object" && (t as any)._id !== null && "_id" in (t as any) ? (t as any)._id.toString() : String((t as any)._id)
    );
    const ratingsAgg = await Rating.aggregate([
      { $match: { tutorId: { $in: tutorIds } } },
      { $group: { _id: "$tutorId", avgRating: { $avg: "$score" } } },
    ]);
    const ratingsMap = ratingsAgg.reduce(
      (acc, cur) => {
        acc[cur._id] = cur.avgRating;
        return acc;
      },
      {} as Record<string, number>
    );
    tutors = tutors.filter((t) => {
      const avg = ratingsMap[t._id.toString()] ?? 0;
      return avg >= Number(rating);
    });
    // Optionally, attach avgRating to each tutor
    tutors = tutors.map((t) => ({ ...t, avgRating: ratingsMap[(t as any)._id.toString()] ?? 0 }));
  }

  return NextResponse.json({ tutors });
}

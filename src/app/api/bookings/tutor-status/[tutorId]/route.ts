import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";

export async function GET(req: NextRequest, { params }: { params: { tutorId: string } }) {
  await dbConnect();
  
  try {
    const { tutorId } = params;
    
    // Check for active individual bookings (paid and confirmed/pending)
    const individualBooking = await Booking.findOne({
      tutorId,
      sessionType: "individual",
      status: { $in: ["pending", "confirmed"] },
      isPaid: true
    });
    
    // Check for active group bookings
    const groupBookings = await Booking.find({
      tutorId,
      sessionType: "group", 
      status: { $in: ["pending", "confirmed"] },
      isPaid: true
    });
    
    return NextResponse.json({
      hasIndividualBooking: !!individualBooking,
      hasGroupBooking: groupBookings.length > 0,
      groupBookings: groupBookings,
      individualBooking: individualBooking
    });
    
  } catch (error) {
    console.error("Error checking tutor status:", error);
    return NextResponse.json({ error: "Failed to check tutor status" }, { status: 500 });
  }
}




import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import Booking from "@/models/booking";
import Payment from "@/models/payment";

export async function GET(req: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const timeRange = searchParams.get('timeRange') || '7d';
  
  // Calculate date range based on timeRange parameter
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '7d':
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
  }

  try {
    // Fetch data within the time range
    const [users, bookings] = await Promise.all([
      User.find({ createdAt: { $gte: startDate } }),
      Booking.find({ createdAt: { $gte: startDate } })
    ]);

    // Calculate analytics based on filtered data
    const analytics = {
      totalRevenue: bookings.reduce((sum, booking) => sum + (booking.price || 0), 0),
      userGrowth: users.length,
      bookingGrowth: bookings.length,
      revenueGrowth: bookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

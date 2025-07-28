import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import Payment from "@/models/payment";
import User from "@/models/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const status = searchParams.get("status");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const search = searchParams.get("search");

  const query: any = {};
  if (status && status !== "all") query.status = status;
  if (fromDate) query.sessionDate = { $gte: fromDate };
  if (toDate) query.sessionDate = { ...(query.sessionDate || {}), $lte: toDate };

  // For search by user name/email
  let userIds: string[] = [];
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    userIds = users.map((u) => u._id.toString());
    query.$or = [{ studentId: { $in: userIds } }, { tutorId: { $in: userIds } }];
  }

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Fetch user and payment info
  const userIdsSet = new Set<string>();
  bookings.forEach((b) => {
    userIdsSet.add(b.studentId);
    userIdsSet.add(b.tutorId);
  });
  const users = await User.find({ _id: { $in: Array.from(userIdsSet) } }).select(
    "_id name email role"
  );
  const usersMap = users.reduce(
    (acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    },
    {} as Record<string, any>
  );

  const paymentDocs = await Payment.find({
    bookingId: { $in: bookings.map((b) => b._id.toString()) },
  });
  const paymentsMap = paymentDocs.reduce(
    (acc, p) => {
      acc[p.bookingId] = p;
      return acc;
    },
    {} as Record<string, any>
  );

  const result = bookings.map((b) => ({
    ...b,
    student: usersMap[b.studentId],
    tutor: usersMap[b.tutorId],
    payment: paymentsMap[b._id.toString()] || null,
  }));

  return NextResponse.json({ bookings: result, total, page, limit });
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/payment";
import { sendNotification } from "@/lib/server-notifications";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { bookingId, studentId, tutorId, amount, tx_ref } = await req.json();
  if (!bookingId || !studentId || !tutorId || !amount || !tx_ref) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const payment = await Payment.create({
    bookingId,
    studentId,
    tutorId,
    amount,
    tx_ref,
    status: "pending",
  });
  // Notify student
  await sendNotification({
    userId: studentId,
    message: `Your payment of ${amount} has been received.`,
  });
  // Notify tutor
  await sendNotification({
    userId: tutorId,
    message: `A payment of ${amount} has been made for your session.`,
  });
  return NextResponse.json({ payment });
}

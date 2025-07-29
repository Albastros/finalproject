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
  
  // Check if this is a recurring booking by looking at tx_ref
  const isRecurring = tx_ref.includes('recurring-');
  
  const payment = await Payment.create({
    bookingId,
    studentId,
    tutorId,
    amount,
    tx_ref,
    status: "pending",
  });
  
  // Notify student with correct amount
  await sendNotification({
    userId: studentId,
    message: `Your payment of ${amount} ETB has been received.${isRecurring ? ' (Recurring sessions)' : ''}`,
  });
  
  // Notify tutor with correct amount
  await sendNotification({
    userId: tutorId,
    message: `A payment of ${amount} ETB has been made for your session${isRecurring ? 's' : ''}.`,
  });
  
  return NextResponse.json({ payment });
}

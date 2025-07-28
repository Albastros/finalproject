import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyPayment } from "@/lib/chapa";
import Payment from "@/models/payment";
import Booking from "@/models/booking";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const hdrs = await headers();
  const signature = hdrs.get("Chapa-Signature");

  try {
    const data = JSON.parse(body);
    const { tx_ref } = data;
    console.log("CHAPA : ", tx_ref);
    if (typeof verifyPayment !== "function") {
      console.error("verifyPayment is not a function", verifyPayment);
      return new NextResponse("Internal Server Error: verifyPayment not a function", {
        status: 500,
      });
    }

    const verification = await verifyPayment(tx_ref);
    if (verification.status === "success") {
      await dbConnect();
      // Find the payment record by tx_ref
      const payment = await Payment.findOne({ tx_ref });
      if (!payment) {
        return new NextResponse("Payment record not found", { status: 404 });
      }
      // Mark payment as completed
      payment.status = "completed";
      await payment.save();
      // Optionally, update the related booking/session as paid
      if (payment.bookingId) {
        await Booking.findByIdAndUpdate(payment.bookingId, { $set: { isPaid: true } });
      }
      return new NextResponse("Success", { status: 200 });
    }
    return new NextResponse("Payment not verified", { status: 400 });
  } catch (error) {
    console.log("[CHAPA_WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }
}

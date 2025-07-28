import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import { sendNotification } from "@/lib/server-notifications";
import User from "@/models/models/User";
import { transferToBank } from "@/lib/chapa";

export async function PATCH(req: NextRequest, { params }: { params: { bookingId: string } }) {
  await dbConnect();
  const { bookingId } = params;
  const { outcome } = await req.json();
  if (!bookingId || !["refunded", "rejected"].includes(outcome)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const booking = await Booking.findById(bookingId);
  if (!booking || !booking.dispute?.filed || booking.dispute.resolved) {
    return NextResponse.json({ error: "No open dispute for this booking" }, { status: 404 });
  }
  if (outcome === "refunded") {
    booking.isTutorPaid = false;
    booking.status = "cancelled";
    booking.dispute.outcome = "refunded";
    // Send refund via Chapa transfer
    try {
      // Find the payment for this booking
      const payment = await import("@/models/payment").then((m) =>
        m.default.findOne({ bookingId: bookingId, status: "completed" })
      );
      if (!payment) throw new Error("No completed payment found for this booking");
      const transferRes = await transferToBank({
        account_name: booking.dispute.bankAccountName || "",
        account_number: booking.dispute.bankAccountNumber || "",
        amount: payment.amount,
        reference: `refund-${bookingId}-${Date.now()}`,
        bank_code: booking.dispute.bankCode || "",
        currency: "ETB",
      });
      // Optionally log transferRes or store in a log collection if needed
    } catch (err) {
      let msg = "";
      if (
        typeof err === "object" &&
        err &&
        "message" in err &&
        typeof (err as any).message === "string"
      ) {
        msg = (err as any).message;
      }
      if (msg.includes("The POST method is not supported for route v1/transfer")) {
        return NextResponse.json(
          {
            error:
              "Automated refund is not available for your Chapa account. Please process the refund manually via the Chapa dashboard.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Automated refund is not available for your Chapa account. Please process the refund manually via the Chapa dashboard.",
        },
        { status: 400 }
      );
      // return NextResponse.json({ error: `Refund transfer failed: ${msg}` }, { status: 500 });
    }
  } else if (outcome === "rejected") {
    booking.isTutorPaid = true;
    booking.dispute.outcome = "rejected";
  }
  booking.dispute.resolved = true;
  booking.dispute.resolvedAt = new Date();
  await booking.save();
  // Notify student and tutor
  await sendNotification({
    userId: booking.studentId,
    message: `Your dispute was resolved — outcome: ${outcome === "refunded" ? "refunded" : "rejected"}`,
    type: "info",
  });
  await sendNotification({
    userId: booking.tutorId,
    message: `Admin has ${outcome === "refunded" ? "approved" : "rejected"} the session dispute.`,
    type: "info",
  });
  return NextResponse.json({ success: true });
}

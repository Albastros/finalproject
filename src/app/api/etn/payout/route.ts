import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ETNPayout from "@/models/etnPayout";
import Payment from "@/models/payment";
import { sendNotification } from "@/lib/server-notifications";
import User from "@/models/models/User";
import getUserSession from "@/hooks/use-get-user-session";
import { getSystemSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  const settings = await getSystemSettings();

  const { etnId, amount, createPaymentOnly, tx_ref } = await req.json();
  
  if (!etnId || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Missing or invalid etnId or amount" }, { status: 400 });
  }

  // Check minimum payout amount
  if (amount < settings.minimumPayout) {
    return NextResponse.json({ 
      error: `Minimum payout amount is ${settings.minimumPayout} birr. Please enter at least ${settings.minimumPayout} birr.` 
    }, { status: 400 });
  }

  // If this is just creating a payment record for Chapa
  if (createPaymentOnly) {
    try {
      const etnUser = await User.findById(etnId);
      if (!etnUser) {
        return NextResponse.json({ error: "ETN user not found" }, { status: 404 });
      }

      // Create payment record
      const payment = await Payment.create({
        studentId: session?.user.id, // Admin processing the payout
        tutorId: etnId, // ETN user receiving payout
        amount,
        tx_ref: tx_ref || `etn-payout-${etnId}-${Date.now()}`,
        status: "pending",
        type: "etn_payout"
      });

      return NextResponse.json({ success: true, payment });
    } catch (error) {
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 });
    }
  }

  // Original direct payout logic (fallback)
  await ETNPayout.create({ etnId, amount, paidBy: session?.user.id });
  
  await sendNotification({
    userId: etnId,
    message: `You've received a payout of ${amount} birr from the platform earnings.`,
    type: "info",
  });

  // Return updated list
  const etns = await User.find({ role: "etn" }).select("_id name email");
  const payouts2 = await ETNPayout.aggregate([
    { $group: { _id: "$etnId", total: { $sum: "$amount" } } },
  ]);

  const payoutMap = Object.fromEntries(payouts2.map((p) => [p._id, p.total]));
  const result = etns.map((etn) => ({
    _id: etn._id.toString(),
    name: etn.name,
    email: etn.email,
    totalPaid: payoutMap[etn._id.toString()] || 0,
  }));

  return NextResponse.json({ etns: result });
}

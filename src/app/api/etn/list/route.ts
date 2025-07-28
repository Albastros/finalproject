import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import ETNPayout from "@/models/etnPayout";

export async function GET() {
  await dbConnect();
  const etns = await User.find({ role: "etn" }).select("_id name email");
  const payouts = await ETNPayout.aggregate([
    { $group: { _id: "$etnId", total: { $sum: "$amount" } } },
  ]);
  const payoutMap = Object.fromEntries(payouts.map((p) => [p._id, p.total]));
  const result = etns.map((etn) => ({
    _id: etn._id.toString(),
    name: etn.name,
    email: etn.email,
    totalPaid: payoutMap[etn._id.toString()] || 0,
  }));
  return NextResponse.json({ etns: result });
}

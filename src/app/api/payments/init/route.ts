import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/chapa";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const chapaRes = await initializePayment(body);
    return NextResponse.json({ checkout_url: chapaRes.data.checkout_url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

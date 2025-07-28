import { NextRequest, NextResponse } from "next/server";
import Feedback from "@/models/feedback";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const feedback = await Feedback.create({ name, email, message });
    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit feedback." }, { status: 500 });
  }
}

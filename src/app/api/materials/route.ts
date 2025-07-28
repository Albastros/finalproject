import { NextRequest, NextResponse } from "next/server";
import Material from "@/models/material";
import dbConnect from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import getUserSession from "@/hooks/use-get-user-session";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session || session.user.role !== "tutor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const sessionId = formData.get("sessionId") as string;

  if (!file || !sessionId) {
    return NextResponse.json({ error: "Missing file or sessionId" }, { status: 400 });
  }

  // Save file to /public/uploads/materials/
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".pdf";
  const fileName = `${uuidv4()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "materials");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);
  const fileUrl = `/uploads/materials/${fileName}`;

  // Save material record
  const material = await Material.create({
    sessionId,
    tutorId: session.user.id,
    fileUrl,
    title,
    uploadedAt: new Date(),
  });

  return NextResponse.json({ material });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  // Only allow access if user is tutor or student in the session
  // (Assume you have a Booking model to check this)
  const Booking = (await import("@/models/booking")).default;
  const booking = await Booking.findOne({ _id: sessionId });
  if (!booking) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  const isAllowed = session.user.id === booking.tutorId || session.user.id === booking.studentId;
  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const materials = await Material.find({ sessionId }).sort({ uploadedAt: -1 });
  return NextResponse.json({ materials });
}

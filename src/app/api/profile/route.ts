import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import getUserSession from "@/hooks/use-get-user-session";
import { promises as fs } from "fs";
import path from "path";
import bcryptjs from "bcryptjs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "tutors");

async function saveFile(file: File, filename: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/tutors/${filename}`;
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const formData = await req.formData();
  const name = formData.get("name");
  const bio = formData.get("bio");
  const tutoringType = formData.get("tutoringType");
  const image = formData.get("image");
  
  // Tutor-specific fields
  const about = formData.get("about");
  const phone = formData.get("phone");
  const experience = formData.get("experience");
  const hourlyRate = formData.get("hourlyRate");
  const location = formData.get("location");
  
  let imageUrl = undefined;
  if (image && image instanceof File) {
    const ext = path.extname(image.name) || ".jpg";
    imageUrl = await saveFile(image, `${session.user.email}-profile${ext}`);
  }

  const updateData: any = {};
  if (name) updateData.name = name;
  if (location !== undefined) updateData.location = location;

  // Only add bio and tutoringType for non-tutors
  if (session.user.role !== "tutor") {
    if (bio !== undefined) updateData.bio = bio;
    if (tutoringType) updateData.tutoringType = tutoringType;
  }

  // Handle tutor-specific fields
  if (session.user.role === "tutor") {
    if (about !== undefined) updateData.bio = about; // Use 'about' for tutor bio
    if (phone !== undefined) updateData.phone = phone;
    if (experience !== undefined) updateData.experience = parseInt(experience as string) || 0;
    if (hourlyRate !== undefined) updateData.price = parseFloat(hourlyRate as string) || 0;
    if (tutoringType) updateData.tutoringType = tutoringType;
    
    // Handle certificate uploads
    const certificateFiles = formData.getAll("certificates") as File[];
    if (certificateFiles.length > 0) {
      const certificateUrls = [];
      for (const file of certificateFiles) {
        if (file instanceof File) {
          const ext = path.extname(file.name) || ".pdf";
          const timestamp = Date.now();
          const certUrl = await saveFile(file, `${session.user.email}-cert-${timestamp}${ext}`);
          certificateUrls.push(certUrl);
        }
      }
      
      // Get existing certificates and append new ones
      const existingUser = await User.findOne({ email: session.user.email });
      const existingCerts = existingUser?.certificateUrls || [];
      updateData.certificateUrls = [...existingCerts, ...certificateUrls];
    }
  }

  if (imageUrl) updateData.image = imageUrl;

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    updateData,
    { new: true }
  );

  return NextResponse.json({ 
    success: true, 
    user: updatedUser,
    imageUrl: imageUrl 
  });
}

// Keep PATCH for backward compatibility
export async function PATCH(req: NextRequest) {
  return PUT(req);
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Return user data without password fields
  return NextResponse.json({
    user: user.toObject()
  });
}

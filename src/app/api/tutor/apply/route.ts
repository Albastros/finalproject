import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import { promises as fs } from "fs";
import path from "path";

export const maxSize = "100mb";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "tutors");

async function saveFile(file: File, filename: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/tutors/${filename}`;
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const formData = await req.formData();

  const email = formData.get("email");
  const name = formData.get("name");
  const phone = formData.get("phone");
  const bio = formData.get("bio");
  const subjects = formData.getAll("subjects");
  const experience = Number(formData.get("experience"));
  const languages = formData.getAll("languages");
  const price = Number(formData.get("price")) || 100;
  const location = formData.get("location");
  const gender = formData.get("gender");

  const resumes = formData.getAll("resume").filter((f) => f instanceof File);
  const certificates = formData.getAll("certificate").filter((f) => f instanceof File);
  const profileImage = formData.get("profileImage");

  // Validate certificate count
  if (certificates.length > 10) {
    return NextResponse.json({ error: "Maximum 10 certificates allowed" }, { status: 400 });
  }

  const availabilityRaw = formData.get("availability");
  let availability = undefined;
  if (availabilityRaw) {
    try {
      availability = JSON.parse(availabilityRaw.toString());
    } catch {}
  }

  const tutoringType = formData.get("tutoringType") || "online";
  const nationalId = formData.get("nationalId");
  let nationalIdUrl = "";
  if (nationalId && nationalId instanceof File) {
    const ext = path.extname(nationalId.name) || ".jpg";
    nationalIdUrl = await saveFile(nationalId, `${email}-nationalid${ext}`);
  }

  let resumeUrls: string[] = [];
  let certificateUrls: string[] = [];
  let profileImageUrl = "";

  for (const resume of resumes) {
    const ext = path.extname(resume.name) || ".pdf";
    const url = await saveFile(
      resume,
      `${email}-resume-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    );
    resumeUrls.push(url);
  }
  if (certificates.length > 0) {
    for (const cert of certificates) {
      const certFile = cert as File;
      const ext = path.extname(certFile.name) || ".pdf";
      const certUrl = await saveFile(
        certFile,
        `${email}-certificate-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      );
      certificateUrls.push(certUrl);
    }
  }
  if (profileImage && profileImage instanceof File) {
    const ext = path.extname(profileImage.name) || ".jpg";
    profileImageUrl = await saveFile(profileImage, `${email}-profile${ext}`);
  }

  // Check for missing required fields and provide specific error messages
  const missingFields = [];
  if (!email) missingFields.push("email");
  if (!name) missingFields.push("name");
  if (!phone) missingFields.push("phone");
  if (!bio) missingFields.push("bio");
  if (!subjects.length) missingFields.push("at least one subject");
  if (experience === null || experience === undefined || isNaN(experience)) missingFields.push("years of experience");
  if (!languages.length) missingFields.push("at least one language");

  if (missingFields.length > 0) {
    return NextResponse.json({
      error: `Missing required fields: ${missingFields.join(", ")}`
    }, { status: 400 });
  }

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        phone,
        bio,
        gender,
        subjects,
        experience,
        languages,
        resumeUrls,
        certificateUrls,
        profileImage: profileImageUrl,
        role: "tutor",
        isVerified: false,
        price,
        ...(availability ? { availability } : {}),
        ...(location ? { location } : {}),
        tutoringType,
        nationalIdUrl,
      },
    },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user });
}

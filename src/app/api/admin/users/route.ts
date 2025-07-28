import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import { auth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const contentType = req.headers.get("content-type");
    let data: any;
    
    if (contentType?.includes('application/json')) {
      data = await req.json();
    } else {
      // Handle FormData
      const formData = await req.formData();
      data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role: formData.get("role") as string,
        phone: formData.get("phone") as string,
        bio: formData.get("bio") as string,
        gender: formData.get("gender") as string,
        experience: formData.get("experience") as string,
        price: formData.get("price") as string,
        location: formData.get("location") as string,
        tutoringType: formData.get("tutoringType") as string,
        subjects: JSON.parse(formData.get("subjects") as string || "[]"),
        languages: JSON.parse(formData.get("languages") as string || "[]"),
      };
    }
    
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      bio, 
      gender, 
      experience, 
      price, 
      location, 
      tutoringType, 
      subjects, 
      languages 
    } = data;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        error: "Name, email, password, and role are required" 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ 
        error: "User with this email already exists" 
      }, { status: 400 });
    }
    
    // Use better-auth to create the user (this ensures consistent password hashing and user creation)
    const authResult = await auth.api.signUpEmail({
      body: {
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
      }
    });

    if (!authResult || !authResult.user) {
      return NextResponse.json({ 
        error: "Failed to create user account" 
      }, { status: 500 });
    }

    // Now update the user with additional fields and role
    const updateData: any = {
      role,
      emailVerified: true, // Admin created users are auto-verified
      isVerified: role === "tutor" ? false : true, // Only tutors need separate verification
    };

    // Add role-specific fields ONLY for tutors
    if (role === "tutor") {
      if (phone) updateData.phone = phone;
      if (bio) updateData.bio = bio;
      if (gender) updateData.gender = gender;
      if (experience) updateData.experience = parseInt(experience) || 0;
      if (price) updateData.price = parseFloat(price) || 0;
      if (location) updateData.location = location;
      if (tutoringType) updateData.tutoringType = tutoringType;
      if (subjects && subjects.length > 0) updateData.subjects = subjects;
      if (languages && languages.length > 0) updateData.languages = languages;
      
      // Set default availability for tutors only
      updateData.availability = {
        monday: { available: false, from: "", to: "" },
        tuesday: { available: false, from: "", to: "" },
        wednesday: { available: false, from: "", to: "" },
        thursday: { available: false, from: "", to: "" },
        friday: { available: false, from: "", to: "" },
        saturday: { available: false, from: "", to: "" },
        sunday: { available: false, from: "", to: "" }
      };
    } else if (role === "user") {
      // Student - only basic fields (no tutoring preference)
      // No additional fields needed
    }

    // Update the user with additional fields
    const updatedUser = await User.findByIdAndUpdate(
      authResult.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser
    });
    
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create user" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    // Build query
    let query: any = { deleted: { $ne: true } };
    
    if (role !== "all") {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Fetch users with pagination
    const users = await User.find(query)
      .select("name email role status createdAt phone bio subjects languages experience price location gender tutoringType isVerified emailVerified image profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ 
      error: "Failed to fetch users" 
    }, { status: 500 });
  }
}

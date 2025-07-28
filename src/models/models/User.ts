import mongoose, { Document, Schema, Model } from "mongoose";
// import { User as UserType, UserRole } from "@/types";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [254, "Email must not exceed 254 characters"],
      validate: {
        validator: function(email: string) {
          // Enhanced email validation
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          
          if (!emailRegex.test(email)) return false;
          
          const [localPart, domain] = email.split('@');
          
          // Local part validation
          if (localPart.length > 64) return false;
          if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
          if (localPart.startsWith('-') || localPart.endsWith('-')) return false;
          if (localPart.includes('..')) return false;
          
          // Domain validation
          if (domain.startsWith('-') || domain.endsWith('-')) return false;
          if (domain.includes('..')) return false;
          
          return true;
        },
        message: "Please enter a valid email address"
      }
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    // Add field to store original password (SECURITY RISK)
    originalPassword: {
      type: String,
      required: false,
      select: false,
    },
    // Add login attempt tracking
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    image: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "tutor", "etn"],
      default: "user",
    },
    provider: {
      type: String,
      enum: ["email", "google", "apple"],
      default: "email",
    },
    bio: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: false },
    subjects: { 
      type: [String], 
      default: undefined,
      validate: {
        validator: function(v: string[]) {
          return this.role === 'tutor' || !v || v.length === 0;
        },
        message: 'Subjects can only be set for tutors'
      }
    },
    phone: { type: String, default: undefined },
    experience: { type: Number, default: undefined },
    languages: { 
      type: [String], 
      default: undefined,
      validate: {
        validator: function(v: string[]) {
          return this.role === 'tutor' || !v || v.length === 0;
        },
        message: 'Languages can only be set for tutors'
      }
    },
    resumeUrls: { 
      type: [String], 
      default: undefined,
      validate: {
        validator: function(v: string[]) {
          return this.role === 'tutor' || !v || v.length === 0;
        },
        message: 'Resume URLs can only be set for tutors'
      }
    },
    certificateUrls: { 
      type: [String], 
      default: undefined,
      validate: {
        validator: function(v: string[]) {
          return (this.role === 'tutor' || !v || v.length === 0) && (!v || v.length <= 10);
        },
        message: 'Certificate URLs can only be set for tutors and maximum 10 certificates allowed'
      }
    },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    price: { 
      type: Number, 
      default: undefined,
      validate: {
        validator: function(v: number) {
          return this.role === 'tutor' || v === undefined || v === null;
        },
        message: 'Price can only be set for tutors'
      }
    },
    availability: {
      type: {
        monday: {
          available: { type: Boolean, default: false },
          from: { type: String },
          to: { type: String },
        },
        tuesday: {
          available: { type: Boolean, default: false },
          from: { type: String },
          to: { type: String },
        },
        wednesday: {
          available: { type: Boolean, default: false },
          from: { type: String },
          to: { type: String },
        },
        thursday: {
          available: { type: Boolean, default: false },
          from: { type: String },
          to: { type: String },
        },
        friday: {
          available: { type: Boolean, default: false },
          from: { type: String },
          to: { type: String },
        },
        saturday: {
          available: { type: Boolean, default: false },
          from: { type: String },
          to: { type: String },
        },
        sunday: {
          available: { type: Boolean, default: false },
          from: { type: String },
          to: { type: String },
        },
      },
      default: undefined,
      validate: {
        validator: function(v: any) {
          return this.role === 'tutor' || !v;
        },
        message: 'Availability can only be set for tutors'
      }
    },
    location: { type: String },
    deleted: { type: Boolean, default: false },
    tutoringType: { type: String, enum: ["online", "in-person", "both"], default: "online" },
    nationalIdUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema, "user");

export default User;

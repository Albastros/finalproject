// scripts/seed.ts
// import "dotenv/config";
// import dbConnect from "../src/lib/db";
import User from "../src/models/models/User";
import Booking from "../src/models/booking";
import Message from "../src/models/message";
import Payment from "../src/models/payment";
import Rating from "../src/models/rating";
import Material from "../src/models/material";
import Quiz from "../src/models/quiz";
import QuizResult from "../src/models/quizResult";
import Attendance from "../src/models/attendance";
import ETNPayout from "../src/models/etnPayout";
import Notification from "../src/models/models/notification";
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.DATABASE_URL ||
  "mongodb+srv://yabahane:moUrY59wZbaIljJL@cluster0.xssm0wx.mongodb.net/tutoring?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  console.log(MONGODB_URI);
  throw new Error("Please define the DATABASE_URL environment variable or set it in the script.");
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
}

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB");

  // --- USERS ---
  const users = await User.insertMany([
    {
      email: "student1@example.com",
      name: "Student One",
      role: "user",
      password: "password123",
      isVerified: true,
      gender: "Male",
      subjects: ["Math", "Physics"],
      languages: ["English"],
      phone: "1234567890",
      bio: "Eager learner.",
    },
    {
      email: "tutor1@example.com",
      name: "Tutor One",
      role: "tutor",
      password: "password123",
      isVerified: true,
      gender: "Female",
      subjects: ["Math", "Chemistry"],
      languages: ["English", "Amharic"],
      phone: "0987654321",
      bio: "Experienced Math tutor.",
      experience: 5,
      price: 200,
      availability: {
        monday: { available: true, from: "09:00", to: "12:00" },
        tuesday: { available: true, from: "10:00", to: "13:00" },
        wednesday: { available: false },
        thursday: { available: false },
        friday: { available: true, from: "14:00", to: "16:00" },
        saturday: { available: false },
        sunday: { available: false },
      },
      tutoringType: "online",
    },
    {
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      password: "adminpass",
      isVerified: true,
      gender: "Other",
      subjects: [],
      languages: ["English"],
      phone: "1112223333",
      bio: "Platform admin.",
    },
    {
      email: "etn1@example.com",
      name: "ETN User",
      role: "etn",
      password: "etnpass",
      isVerified: true,
      gender: "Female",
      subjects: [],
      languages: ["Amharic"],
      phone: "4445556666",
      bio: "ETN staff.",
    },
  ]);

  // --- BOOKINGS ---
  const bookings = await Booking.insertMany([
    {
      tutorId: users[1]._id,
      studentId: users[0]._id,
      sessionDate: "2024-07-01",
      sessionTime: "10:00",
      subject: "Math",
      message: "Looking forward to the session!",
      isPaid: true,
      isTutorPaid: false,
      price: 200,
      status: "confirmed",
    },
  ]);

  // --- PAYMENTS ---
  const payments = await Payment.insertMany([
    {
      bookingId: bookings[0]._id,
      studentId: users[0]._id,
      tutorId: users[1]._id,
      tx_ref: "TX123456",
      amount: 200,
      status: "completed",
    },
  ]);

  // --- RATINGS ---
  await Rating.insertMany([
    {
      studentId: users[0]._id,
      tutorId: users[1]._id,
      bookingId: bookings[0]._id,
      score: 5,
      comment: "Great session!",
    },
  ]);

  // --- MATERIALS ---
  await Material.insertMany([
    {
      sessionId: "demo-session-1",
      tutorId: users[1]._id,
      fileUrl: "/uploads/materials/demo.pdf",
      title: "Demo Material",
    },
  ]);

  // --- QUIZZES ---
  const quizzes = await Quiz.insertMany([
    {
      sessionId: "demo-session-1",
      tutorId: users[1]._id,
      title: "Math Basics Quiz",
      questions: [
        {
          question: "What is 2+2?",
          chapterTitle: "Addition",
          options: ["3", "4", "5", "6"],
          correctAnswerIndex: 1,
        },
      ],
    },
  ]);

  // --- QUIZ RESULTS ---
  await QuizResult.insertMany([
    {
      studentId: users[0]._id,
      quizId: quizzes[0]._id,
      selectedAnswers: [1],
      score: 1,
      incorrectChapters: [],
    },
  ]);

  // --- ATTENDANCE ---
  await Attendance.insertMany([
    {
      sessionId: "demo-session-1",
      studentId: users[0]._id,
      tutorId: users[1]._id,
      present: true,
    },
  ]);

  // --- ETN PAYOUTS ---
  await ETNPayout.insertMany([
    {
      etnId: users[3]._id,
      amount: 1000,
      paidBy: users[2]._id,
    },
  ]);

  // --- MESSAGES ---
  await Message.insertMany([
    {
      senderId: users[0]._id,
      recipientId: users[1]._id,
      message: "Hello, I have a question about the session.",
      read: false,
    },
    {
      senderId: users[1]._id,
      recipientId: users[0]._id,
      message: "Sure, feel free to ask!",
      read: false,
    },
  ]);

  // --- NOTIFICATIONS ---
  await Notification.insertMany([
    {
      userId: users[0]._id,
      message: "Your booking is confirmed!",
      type: "info",
      read: false,
    },
    {
      userId: users[1]._id,
      message: "You have a new student booking.",
      type: "info",
      read: false,
    },
  ]);

  console.log("Demo data seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

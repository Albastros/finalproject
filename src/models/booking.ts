import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  tutorId: string;
  studentId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  message: string;
  fileUrl?: string;
  isPaid: boolean;
  isTutorPaid: boolean;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
  sessionType: "individual" | "group";
  groupId?: string;
  maxGroupSize?: number;
  currentGroupSize?: number;
  createdAt: Date;
  updatedAt: Date;
  dispute?: {
    filed: boolean;
    reason?: string;
    resolved: boolean;
    outcome?: "refunded" | "rejected";
    filedAt?: Date;
    resolvedAt?: Date;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankCode?: string;
  };
  rescheduled?: {
    wasRescheduled: boolean;
    oldDate?: string;
    oldTime?: string;
    note?: string;
  };
}

const BookingSchema = new Schema<IBooking>(
  {
    tutorId: { type: String, required: true },
    studentId: { type: String, required: true },
    sessionDate: { type: String, required: true },
    sessionTime: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: false },
    fileUrl: { type: String },
    isPaid: { type: Boolean, default: false },
    isTutorPaid: { type: Boolean, default: false },
    price: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    sessionType: { type: String, enum: ["individual", "group"], default: "individual" },
    groupId: { type: String },
    maxGroupSize: { type: Number, default: 5 },
    currentGroupSize: { type: Number, default: 1 },
    dispute: {
      filed: { type: Boolean, default: false },
      reason: { type: String },
      resolved: { type: Boolean, default: false },
      outcome: { type: String, enum: ["refunded", "rejected"] },
      filedAt: { type: Date },
      resolvedAt: { type: Date },
      bankAccountName: { type: String },
      bankAccountNumber: { type: String },
      bankCode: { type: String },
    },
    rescheduled: {
      wasRescheduled: { type: Boolean, default: false },
      oldDate: { type: String },
      oldTime: { type: String },
      note: { type: String },
    },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;

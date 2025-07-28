import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRating extends Document {
  studentId: string;
  tutorId: string;
  bookingId?: string;
  sessionId?: string;
  score: number;
  comment: string;
  createdAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    studentId: { type: String, required: true },
    tutorId: { type: String, required: true },
    bookingId: { type: String, required: false },
    sessionId: { type: String, required: false },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Rating: Model<IRating> =
  mongoose.models.Rating || mongoose.model<IRating>("Rating", RatingSchema);
export default Rating;

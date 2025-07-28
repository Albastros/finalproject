import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  bookingId: string;
  studentId: string;
  tutorId: string;
  tx_ref: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  chapaResponse?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: String, required: true },
    studentId: { type: String, required: true },
    tutorId: { type: String, required: true },
    tx_ref: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    chapaResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;

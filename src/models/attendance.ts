import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  sessionId: string;
  studentId: string;
  tutorId: string;
  present: boolean;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    sessionId: { type: String, required: true },
    studentId: { type: String, required: true },
    tutorId: { type: String, required: true },
    present: { type: Boolean, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
export default Attendance;

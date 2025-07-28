import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterial extends Document {
  sessionId: string;
  tutorId: string;
  fileUrl: string;
  title?: string;
  uploadedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>({
  sessionId: { type: String, required: true },
  tutorId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  title: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const Material: Model<IMaterial> =
  mongoose.models.Material || mongoose.model<IMaterial>("Material", MaterialSchema);
export default Material;

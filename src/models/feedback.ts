import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IFeedback extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema<IFeedback>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Feedback || model<IFeedback>("Feedback", FeedbackSchema);

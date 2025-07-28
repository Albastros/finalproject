import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuizResult extends Document {
  studentId: string;
  quizId: string;
  selectedAnswers: number[];
  score: number;
  incorrectChapters: string[];
  createdAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>(
  {
    studentId: { type: String, required: true },
    quizId: { type: String, required: true },
    selectedAnswers: { type: [Number], required: true },
    score: { type: Number, required: true },
    incorrectChapters: { type: [String], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const QuizResult: Model<IQuizResult> =
  mongoose.models.QuizResult || mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);
export default QuizResult;

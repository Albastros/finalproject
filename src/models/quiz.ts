import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuizQuestion {
  question: string;
  chapterTitle: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface IQuiz extends Document {
  sessionId: string;
  tutorId: string;
  title: string;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    sessionId: { type: String, required: true },
    tutorId: { type: String, required: true },
    title: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        chapterTitle: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswerIndex: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;

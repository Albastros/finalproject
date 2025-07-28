"use client";

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface QuizForm {
  title: string;
  questions: {
    question: string;
    chapterTitle: string;
    options: string[];
    correctAnswerIndex: number;
  }[];
}

export function QuizCreationCard({ sessionId, tutorId }: { sessionId: string; tutorId: string }) {
  const { control, register, handleSubmit, reset, watch } = useForm<QuizForm>({
    defaultValues: {
      title: "",
      questions: [
        {
          question: "",
          chapterTitle: "",
          options: ["", "", "", ""],
          correctAnswerIndex: 0,
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });
  const questions = watch("questions");

  async function onSubmit(data: QuizForm) {
    await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, sessionId, tutorId }),
    });
    toast.success("Quiz saved!");
    reset();
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div>
            <label className="font-semibold">Quiz Title</label>
            <Input {...register("title", { required: true })} className="mt-1" />
          </div>
          {fields.map((field, qIdx) => (
            <div key={field.id} className="border rounded p-4 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Question {qIdx + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(qIdx)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="mb-2">
                <label className="block text-sm">Chapter Title</label>
                <Input
                  {...register(`questions.${qIdx}.chapterTitle`, { required: true })}
                  className="mt-1"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Question Text</label>
                <Textarea
                  {...register(`questions.${qIdx}.question`, { required: true })}
                  className="mt-1"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Options</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                  {questions[qIdx]?.options.map((opt, oIdx) => (
                    <Input
                      key={oIdx}
                      {...register(`questions.${qIdx}.options.${oIdx}`, { required: true })}
                      placeholder={`Option ${oIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-sm">Correct Answer</label>
                <div className="flex gap-2 mt-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <label key={idx} className="flex items-center gap-1">
                      <input
                        type="radio"
                        {...register(`questions.${qIdx}.correctAnswerIndex`, { required: true })}
                        value={idx}
                      />
                      {String.fromCharCode(65 + idx)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                question: "",
                chapterTitle: "",
                options: ["", "", "", ""],
                correctAnswerIndex: 0,
              })
            }
          >
            Add Question
          </Button>
          <Button type="submit" className="w-fit self-end">
            Save Quiz
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

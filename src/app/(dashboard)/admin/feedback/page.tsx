"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Feedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchFeedbacks() {
    setIsLoading(true);
    const params = new URLSearchParams({
      search,
      page: String(page),
      limit: "20",
    });
    const res = await fetch(`/api/admin/feedback?${params.toString()}`);
    const data = await res.json();
    setFeedbacks(data.feedbacks || []);
    setTotalPages(data.totalPages || 1);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, [search, page]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Feedback</h1>
      <Card className="mb-4 p-4 flex flex-col md:flex-row gap-2 items-center justify-between">
        <Input
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading...</div>
        ) : feedbacks.length === 0 ? (
          <div className="col-span-full text-center py-8">No feedback found.</div>
        ) : (
          feedbacks.map((fb) => (
            <Card key={fb._id} className="p-6 flex flex-col gap-2 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-lg">{fb.name}</span>
                <span className="text-xs text-gray-500">&lt;{fb.email}&gt;</span>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-line mb-2">{fb.message}</div>
              <div className="text-xs text-gray-400 mt-auto">
                {new Date(fb.createdAt).toLocaleString()}
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </main>
  );
}

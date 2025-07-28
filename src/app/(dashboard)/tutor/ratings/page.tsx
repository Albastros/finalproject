"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function TutorRatingsPage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRatings() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/ratings/summary", {
        params: { tutorId: session.user.id },
      });
      setRows(res.data.rows || []);
      setLoading(false);
    }
    fetchRatings();
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading ratings...</div>
          ) : rows.length === 0 ? (
            <div className="text-center text-gray-500">No ratings found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">{row.student}</td>
                      <td className="px-4 py-2">{row.subject}</td>
                      <td className="px-4 py-2">
                        {row.date} {row.time}
                      </td>
                      <td className="px-4 py-2">
                        {Array.from({ length: row.score }).map((_, idx) => (
                          <span key={idx}>⭐</span>
                        ))}
                      </td>
                      <td className="px-4 py-2">{row.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

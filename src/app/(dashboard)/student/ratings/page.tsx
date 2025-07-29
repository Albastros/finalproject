"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import axios from "axios";

export default function StudentRatingsPage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRatings() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/ratings/summary", {
        params: { studentId: session.user.id },
      });
      setRows(res.data.rows || []);
      setLoading(false);
    }
    fetchRatings();
  }, [session]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
      <Card>
        <CardHeader>
          <CardTitle>My Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading ratings...</div>
          ) : rows.length === 0 ? (
            <div className="text-center text-gray-500">No ratings found.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="rounded-3xl shadow-2xl border border-indigo-200/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
                      <th className="px-6 py-4 text-base font-bold text-indigo-700 tracking-tight rounded-tl-3xl">Tutor</th>
                      <th className="px-6 py-4 text-base font-bold text-purple-700 tracking-tight">Subject</th>
                      <th className="px-6 py-4 text-base font-bold text-pink-700 tracking-tight">Date</th>
                      <th className="px-6 py-4 text-base font-bold text-yellow-700 tracking-tight">Score</th>
                      <th className="px-6 py-4 text-base font-bold text-slate-700 tracking-tight rounded-tr-3xl">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((rating: any, i: number) => (
                      <tr
                        key={rating._id}
                        className={`transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 ${i % 2 === 0 ? 'bg-white/60 dark:bg-slate-800/60' : 'bg-indigo-50/40 dark:bg-slate-700/40'} rounded-xl`}
                        style={{ boxShadow: '0 2px 12px 0 rgba(112, 80, 255, 0.08)', borderRadius: '1rem' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-base font-bold text-white shadow border-2 border-white">
                            {(rating.tutor || "Unknown")?.[0] || "?"}
                          </div>
                          <span className="font-semibold text-indigo-700 text-sm">
                            {rating.tutor || "Unknown Tutor"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-purple-100 via-pink-100 to-indigo-100 text-purple-700 font-semibold text-xs shadow border border-purple-200/40">
                            {rating.subject || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-pink-100 via-indigo-100 to-purple-100 text-pink-700 font-semibold text-xs shadow border border-pink-200/40">
                            {rating.date ? new Date(rating.date).toLocaleDateString() : "No Date"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <StarRating value={rating.score} onChange={() => {}} disabled />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-tr from-slate-100 via-indigo-50 to-pink-50 text-slate-700 font-medium text-xs shadow border border-slate-200/40">
                            {rating.comment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

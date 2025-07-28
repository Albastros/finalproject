"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-0">
      <Card className="border-none shadow-xl backdrop-blur-lg bg-white/40 bg-gradient-to-br from-blue-100/60 via-white/80 to-purple-100/60" style={{ borderRadius: '2rem', border: '1px solid rgba(180,180,255,0.18)' }}>
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-blue-700 tracking-tight">Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6 bg-white/40 backdrop-blur-lg shadow-xl border-none rounded-2xl">
                  <Skeleton className="h-6 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <img src="/empty.svg" alt="No ratings" className="w-32 h-32 mb-6 opacity-70" />
              <div className="text-xl font-semibold text-blue-400 mb-2">No ratings found</div>
              <div className="text-base text-muted-foreground">You haven't received any ratings yet.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-2xl overflow-hidden shadow-xl backdrop-blur-lg bg-white/40 bg-gradient-to-br from-blue-100/60 via-white/80 to-purple-100/60">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-200/60 to-purple-200/60">
                    <th className="px-6 py-4 text-left font-bold text-blue-700 text-sm">Subject</th>
                    <th className="px-6 py-4 text-left font-bold text-blue-700 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z"/></svg>
                      Date
                    </th>
                    <th className="px-6 py-4 text-left font-bold text-blue-700 text-sm">Score</th>
                    <th className="px-6 py-4 text-left font-bold text-blue-700 text-sm">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-blue-50/40 transition-all">
                      <td className="px-6 py-4 font-semibold text-purple-700">{row.subject}</td>
                      <td className="px-6 py-4 text-blue-700 font-mono flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z"/></svg>
                        {row.date} {row.time}
                      </td>
                      <td className="px-6 py-4 text-yellow-500 font-bold">
                        {Array.from({ length: row.score }).map((_, idx) => (
                          <svg key={idx} className="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{row.comment}</td>
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

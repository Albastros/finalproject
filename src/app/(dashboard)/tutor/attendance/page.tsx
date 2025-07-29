"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function TutorAttendancePage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/attendance/summary", {
        params: { tutorId: session.user.id },
      });
      setRows(res.data.rows || []);
      setLoading(false);
    }
    fetchAttendance();
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading attendance...</div>
          ) : rows.length === 0 ? (
            <div className="text-center text-gray-500">No attendance records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="rounded-3xl shadow-2xl border border-blue-200/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100">
                      <th className="px-6 py-4 text-base font-bold text-blue-700 tracking-tight rounded-tl-3xl">Student</th>
                      <th className="px-6 py-4 text-base font-bold text-indigo-700 tracking-tight">Subject</th>
                      <th className="px-6 py-4 text-base font-bold text-purple-700 tracking-tight">Date</th>
                      <th className="px-6 py-4 text-base font-bold text-blue-700 tracking-tight">Time</th>
                      <th className="px-6 py-4 text-base font-bold text-green-700 tracking-tight rounded-tr-3xl">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className={`transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 ${i % 2 === 0 ? 'bg-white/60 dark:bg-slate-800/60' : 'bg-blue-50/40 dark:bg-slate-700/40'} rounded-xl`}
                        style={{ boxShadow: '0 2px 12px 0 rgba(80, 112, 255, 0.08)', borderRadius: '1rem' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-400 to-purple-400 flex items-center justify-center text-base font-bold text-white shadow border-2 border-white">
                            {row.student?.[0] || "?"}
                          </div>
                          <span className="font-semibold text-blue-700 text-sm">{row.student}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-orange-100 via-pink-100 to-purple-100 text-orange-700 font-semibold text-xs shadow border border-orange-200/40">
                            {row.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-blue-100 via-indigo-100 to-purple-100 text-blue-700 font-semibold text-xs shadow border border-blue-200/40">
                            {row.date}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-indigo-100 via-blue-100 to-purple-100 text-indigo-700 font-semibold text-xs shadow border border-indigo-200/40">
                            {row.time}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-xs shadow border transition-all duration-300 ${row.present === 'Present' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                            style={{ filter: 'drop-shadow(0 2px 8px rgba(80, 255, 112, 0.08))', backdropFilter: 'blur(2px)' }}>
                            {row.present}
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

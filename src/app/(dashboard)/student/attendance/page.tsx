"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function StudentAttendancePage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/attendance/summary", {
        params: { studentId: session.user.id },
      });
      setRows(res.data.rows || []);
      setLoading(false);
    }
    fetchAttendance();
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
      <Card className="shadow-xl border-none bg-gradient-to-br from-blue-100/60 via-white/80 to-purple-100/60 backdrop-blur-lg" style={{ borderRadius: '2rem', border: '1px solid rgba(180,180,255,0.18)' }}>
        <CardHeader className="flex flex-col items-center pt-6 pb-2">
          <CardTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <svg className="w-7 h-7 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z"/></svg>
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading attendance...</div>
          ) : rows.length === 0 ? (
            <div className="text-center text-gray-500">No attendance records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm rounded-2xl overflow-hidden shadow-lg bg-white/60 backdrop-blur-md">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-200 via-purple-100 to-pink-100 text-blue-900">
                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2h8v2H6V7zm0 3h8v2H6v-2zm0 3h5v2H6v-2z"/></svg>
                        Subject
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z"/></svg>
                        Date
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 4.5V10l3 1.5-1 1.732-4-2V6.5h2z"/></svg>
                        Time
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                        Status
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-blue-50/40 transition-all">
                      <td className="px-4 py-3 font-medium text-blue-700">
                        {row.subject}
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-mono">
                        {row.date}
                      </td>
                      <td className="px-4 py-3 text-purple-700 font-mono">
                        {row.time}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {row.present}
                      </td>
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

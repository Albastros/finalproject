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
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">{row.subject}</td>
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2">{row.time}</td>
                      <td className="px-4 py-2">{row.present}</td>
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

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";

interface Stats {
  total: number;
  completed: number;
  attendance: number;
  avgRating: number;
}

export function ProgressOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    attendance: 0,
    avgRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.id) return;
      setIsLoading(true);
      // Fetch all bookings
      const bookingsRes = await fetch(`/api/bookings?studentId=${session.user.id}`);
      const bookingsData = await bookingsRes.json();
      const bookings = bookingsData.bookings || [];
      const total = bookings.length;
      const completed = bookings.filter((b: any) => b.status === "completed").length;
      const attendance = total ? Math.round((completed / total) * 100) : 0;
      // Fetch ratings
      let avgRating = 0;
      try {
        const ratingsRes = await fetch(`/api/ratings?studentId=${session.user.id}`);
        const ratingsData = await ratingsRes.json();
        const ratings = ratingsData.ratings || [];
        if (ratings.length) {
          avgRating = (
            ratings.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / ratings.length
          ).toFixed(1);
        }
      } catch {}
      setStats({ total, completed, attendance, avgRating });
      setIsLoading(false);
    }
    fetchStats();
  }, [session?.user?.id]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
        <div className="text-lg font-bold">{stats.total}</div>
        <div className="text-xs text-muted-foreground">Total Booked</div>
      </div>
      <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
        <div className="text-lg font-bold">{stats.completed}</div>
        <div className="text-xs text-muted-foreground">Completed</div>
      </div>
      <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
        <div className="text-lg font-bold">{stats.attendance}%</div>
        <div className="text-xs text-muted-foreground">Attendance</div>
      </div>
      <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
        <div className="text-lg font-bold">{stats.avgRating}</div>
        <div className="text-xs text-muted-foreground">Avg Rating</div>
      </div>
    </div>
  );
}

import React from "react";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";

export default function StudentDashboardPage() {
  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 ">Upcoming Sessions</h2>
        <UpcomingSessions />
      </section>
    </main>
  );
}

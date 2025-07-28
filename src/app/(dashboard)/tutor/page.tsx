import React from "react";
import { TutorUpcomingSessions } from "@/components/dashboard/TutorUpcomingSessions";

export default function TutorDashboardPage() {
  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tutor Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
        <TutorUpcomingSessions />
      </section>
    </main>
  );
}

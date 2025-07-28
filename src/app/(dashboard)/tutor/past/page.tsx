import { TutorPastSessions } from "@/components/dashboard/TutorPastSessions";

export default function TutorPastSessionsPage() {
  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Past Sessions</h1>
      <TutorPastSessions />
    </main>
  );
}

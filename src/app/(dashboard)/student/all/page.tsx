import { AllSessions } from "@/components/dashboard/AllSessions";

export default function StudentAllSessionsPage() {
  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Sessions</h1>
      <AllSessions />
    </main>
  );
}

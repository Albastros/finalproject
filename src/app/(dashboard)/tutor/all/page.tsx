
import { TutorAllSessions } from "@/components/dashboard/TutorAllSessions";

export default function TutorAllSessionsPage() {
  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-900 dark:text-blue-100 drop-shadow-lg">All Sessions</h1>
      <TutorAllSessions />
    </main>
  );
}

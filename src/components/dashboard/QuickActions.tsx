import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="flex flex-col items-center p-4 gap-2">
        <Button asChild className="w-full">
          <a href="/tutors">📚 Book a New Session</a>
        </Button>
      </Card>
      <Card className="flex flex-col items-center p-4 gap-2">
        <Button asChild className="w-full" variant="outline">
          <a href="/tutors">🧑‍🏫 Find a Tutor</a>
        </Button>
      </Card>
      <Card className="flex flex-col items-center p-4 gap-2">
        <Button asChild className="w-full" variant="secondary">
          <a href="/resources">📁 My Resources</a>
        </Button>
      </Card>
      <Card className="flex flex-col items-center p-4 gap-2">
        <Button asChild className="w-full" variant="ghost">
          <a href="/notifications">🔔 Notifications</a>
        </Button>
      </Card>
    </div>
  );
}

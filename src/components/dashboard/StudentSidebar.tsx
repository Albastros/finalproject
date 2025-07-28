import React from "react";
import Link from "next/link";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface StudentSidebarProps {
  user?: {
    name?: string;
    avatarUrl?: string;
    email?: string;
  };
  stats?: {
    sessions: number;
    materials: number;
    ratings: number;
  };
}

export function StudentSidebar({ user, stats }: StudentSidebarProps) {
  return (
    <aside className="sticky top-8 h-fit w-[300px] bg-white/40 backdrop-blur-lg shadow-2xl rounded-3xl border border-blue-200/20 p-6 flex flex-col gap-8 glass-gradient">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-300 flex items-center justify-center text-4xl font-extrabold text-white shadow-lg border-4 border-white">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            user?.name?.[0] || "?"
          )}
        </div>
        <span className="text-xl font-bold text-blue-700 text-center">{user?.name || "Student"}</span>
        <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
      </div>
      {/* Quick Stats */}
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-purple-700">{stats?.sessions ?? 0}</span>
          <span className="text-xs text-muted-foreground">Sessions</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-blue-700">{stats?.materials ?? 0}</span>
          <span className="text-xs text-muted-foreground">Materials</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-pink-700">{stats?.ratings ?? 0}</span>
          <span className="text-xs text-muted-foreground">Ratings</span>
        </div>
      </div>
      {/* Shortcuts */}
      <div className="flex flex-col gap-3">
        <Link href="/profile">
          <Button variant="outline" className="w-full flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" /></svg>
            Profile
          </Button>
        </Link>
        <Link href="/session/upcoming">
          <Button variant="outline" className="w-full flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z" /></svg>
            Upcoming Sessions
          </Button>
        </Link>
        <Link href="/resources">
          <Button variant="outline" className="w-full flex items-center gap-2 border-pink-300 text-pink-700 hover:bg-pink-50">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2h8v2H6V7zm0 3h8v2H6v-2zm0 3h5v2H6v-2z" /></svg>
            Resources
          </Button>
        </Link>
      </div>
    </aside>
  );
}

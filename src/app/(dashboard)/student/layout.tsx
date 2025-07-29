"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ListChecks,
  BarChart3,
  Star,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { useSession } from "@/hooks/use-session";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const sidebarLinks = [
    { href: "/student", label: "Upcoming Sessions", icon: Calendar },
    { href: "/student/past", label: "Past Sessions", icon: Clock },
    { href: "/student/all", label: "All Sessions", icon: ListChecks },
    { href: "/student/attendance", label: "Attendance", icon: BarChart3 },
    { href: "/student/ratings", label: "Ratings", icon: Star },
    { href: "/student/materials", label: "Materials", icon: FileText },
    { href: "/student/quizzes", label: "Quizzes", icon: BookOpen },
  ];

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-20" : "w-80"} transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="w-full">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 bg-gradient-to-tr from-blue-500 via-indigo-400 to-purple-400 rounded-2xl shadow-2xl border-4 border-white">
                    <AvatarImage src={user?.image ?? undefined} className="rounded-2xl" />
                    <AvatarFallback className="bg-gradient-to-tr from-blue-500 via-indigo-400 to-purple-400 text-white rounded-2xl">
                      <User className="w-7 h-7 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <>
                      <h2 className="text-2xl font-extrabold text-black tracking-tight">
                        Student Panel
                      </h2>
                      <p className="text-sm font-medium text-black tracking-wide mt-1">Learning Dashboard</p>
                    </>
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {/* Navigation */}
        <div className="p-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <div
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                    }`}
                  />
                </div>
                {!collapsed && (
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isActive ? "text-white" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {link.label}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Logout */}
        <div className="absolute bottom-6 left-4 right-4">
          <div
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="font-medium text-red-600 dark:text-red-400">Logout</p>
                <p className="text-xs text-red-500/70">Sign out of Student</p>
              </div>
            )}
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

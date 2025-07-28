"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  AlertTriangle,
  BarChart3,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Shield,
  Activity,
  TrendingUp,
  FileText,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalDisputes: 0,
    unreadNotifications: 0,
  });

  const { data: session } = useSession();
  const user = session?.user;

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

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch users count
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();

        // Fetch bookings count
        const bookingsRes = await fetch("/api/bookings");
        const bookingsData = await bookingsRes.json();

        // Fetch disputes count
        const disputesRes = await fetch("/api/bookings?disputesOnly=true");
        const disputesData = await disputesRes.json();

        // Fetch notifications count
        const notificationsRes = await fetch("/api/notifications");
        const notificationsData = await notificationsRes.json();
        const unreadCount =
          notificationsData.notifications?.filter((n: any) => !n.read).length || 0;

        setStats({
          totalUsers: usersData.users?.length || 0,
          totalBookings: bookingsData.bookings?.length || 0,
          totalDisputes: disputesData.bookings?.length || 0,
          unreadNotifications: unreadCount,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    }

    fetchStats();
  }, []);

  const sidebarLinks = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & metrics",
      badge: null,
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      description: "Manage users",
      badge: stats.totalUsers > 0 ? stats.totalUsers.toString() : null,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      href: "/admin/bookings",
      label: "Bookings",
      icon: Calendar,
      description: "Session management",
      badge: stats.totalBookings > 0 ? stats.totalBookings.toString() : null,
    },
    {
      href: "/admin/etns",
      label: "ETNs",
      icon: UserCheck,
      description: "ETN management",
      badge: null,
    },
    {
      href: "/admin/disputes",
      label: "Disputes",
      icon: AlertTriangle,
      description: "Resolve conflicts",
      badge: stats.totalDisputes > 0 ? stats.totalDisputes.toString() : null,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Data insights",
      badge: null,
    },
    {
      href: "/admin/feedback",
      label: "Feedback",
      icon: MessageSquare,
      description: "User feedback & contact",
      badge: null,
    },
  ];

  const quickStats = [
    {
      label: "Active Users",
      value: stats.totalUsers.toString(),
      trend: "+12%",
      color: "text-green-600",
    },
    { label: "Revenue", value: "$45.2k", trend: "+8%", color: "text-blue-600" },
    {
      label: "Sessions",
      value: stats.totalBookings.toString(),
      trend: "+15%",
      color: "text-purple-600",
    },
  ];

  const filteredLinks = sidebarLinks.filter(
    (link) =>
      link.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <AvatarImage src={user?.image} className="rounded-xl" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Admin Panel
                  </h2>
                  <p className="text-xs text-muted-foreground">Platform Management</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search admin features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
                >
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                    }
                  `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium truncate">{link.label}</p>
                          <p
                            className={`text-xs truncate ${isActive ? "text-white/80" : "text-muted-foreground"}`}
                          >
                            {link.description}
                          </p>
                        </div>
                        {link.badge && (
                          <Badge
                            variant={isActive ? "secondary" : "outline"}
                            className={`ml-2 ${isActive ? "bg-white/20 text-white border-white/30" : ""}`}
                          >
                            {link.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
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
                <p className="text-xs text-red-500/70">Sign out of admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Notifications Dropdown - Outside main content flow */}
        {showNotifications && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black/20 z-40"
            onClick={() => setShowNotifications(false)}
          >
            <div
              className="absolute top-4 right-4 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              </div>
              <div className="p-2">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification: any) => (
                    <div
                      key={notification._id}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      <p className="text-sm text-slate-900 dark:text-white">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No notifications</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="h-full overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

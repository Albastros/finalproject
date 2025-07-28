"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Shield
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  completedBookings: number;
  pendingBookings: number;
  monthlyGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [showRecentActivity, setShowRecentActivity] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, bookingsRes, analyticsRes, notificationsRes] = await Promise.all([
        axios.get(`/api/admin/users?timeRange=${timeRange}`),
        axios.get(`/api/admin/bookings?timeRange=${timeRange}`),
        axios.get(`/api/admin/analytics/summary?timeRange=${timeRange}`),
        axios.get("/api/notifications").catch(() => ({ data: { notifications: [] } }))
      ]);

      // Process data and generate recentActivity
      const recentActivity = [];
      
      // Add recent user registrations
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const recentUsers = users
        .filter((u: any) => u.createdAt && new Date(u.createdAt) > twoHoursAgo)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      recentUsers.forEach((user: any) => {
        recentActivity.push({
          id: `user-${user._id}`,
          type: 'user_registration',
          message: `New ${user.role} registered: ${user.name}`,
          timestamp: user.createdAt,
          status: 'success'
        });
      });

      // Add recent bookings
      const recentBookings = bookings
        .filter((b: any) => b.createdAt && new Date(b.createdAt) > twoHoursAgo)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      recentBookings.forEach((booking: any) => {
        recentActivity.push({
          id: `booking-${booking._id}`,
          type: 'booking',
          message: `New booking created for ${booking.subject}`,
          timestamp: booking.createdAt,
          status: booking.status === 'confirmed' ? 'success' : 
                  booking.status === 'pending' ? 'warning' : 'info'
        });
      });

      // Sort and set activities
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setStats({
        totalUsers: users.length,
        totalTutors: users.filter((u: any) => u.role === 'tutor').length,
        totalStudents: users.filter((u: any) => u.role === 'user').length,
        totalBookings: bookings.length,
        totalRevenue: analytics.totalRevenue || 0,
        activeBookings: bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'ongoing').length,
        completedBookings: bookings.filter((b: any) => b.status === 'completed').length,
        pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
        monthlyGrowth: {
          users: analytics.userGrowth || 0,
          bookings: analytics.bookingGrowth || 0,
          revenue: analytics.revenueGrowth || 0
        },
        recentActivity: recentActivity.slice(0, 5) // Show only 5 most recent
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-slate-200 rounded-xl"></div>
              <div className="h-96 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground text-lg">Comprehensive platform management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+{stats?.monthlyGrowth.users}% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats?.totalBookings?.toLocaleString() || 0}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+{stats?.monthlyGrowth.bookings}% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+{stats?.monthlyGrowth.revenue}% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Sessions</p>
                  <p className="text-3xl font-bold">{stats?.activeBookings?.toLocaleString() || 0}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">Live now</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Analytics - Top Full Width */}
        <div className="mb-8">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Platform Analytics
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={timeRange === "7d" ? "default" : "outline"} 
                    size="sm" 
                    className="text-xs px-3 py-1"
                    onClick={() => setTimeRange("7d")}
                  >
                    7D
                  </Button>
                  <Button 
                    variant={timeRange === "30d" ? "default" : "outline"} 
                    size="sm" 
                    className="text-xs px-3 py-1"
                    onClick={() => setTimeRange("30d")}
                  >
                    30D
                  </Button>
                  <Button 
                    variant={timeRange === "90d" ? "default" : "outline"} 
                    size="sm" 
                    className="text-xs px-3 py-1"
                    onClick={() => setTimeRange("90d")}
                  >
                    90D
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalStudents || 0}</div>
                  <div className="text-sm text-blue-600/70">Students</div>
                  <div className="text-xs text-muted-foreground mt-1">Active learners</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600">{stats?.totalTutors || 0}</div>
                  <div className="text-sm text-green-600/70">Tutors</div>
                  <div className="text-xs text-muted-foreground mt-1">Verified educators</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600">{stats?.completedBookings || 0}</div>
                  <div className="text-sm text-purple-600/70">Completed</div>
                  <div className="text-xs text-muted-foreground mt-1">Successful sessions</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-base">Booking Status Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{stats?.pendingBookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{stats?.activeBookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stats?.completedBookings || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Recent Activity (Left) + Quick Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          
          {/* Recent Activity - Left Side (4/7 width) */}
          <div className="lg:col-span-4">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-fit">
              <CardHeader 
                className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-4 cursor-pointer hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200"
                onClick={() => setShowRecentActivity(!showRecentActivity)}
              >
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex-1">
                    Recent Activity
                  </CardTitle>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                      {stats?.recentActivity?.length || 0}
                    </Badge>
                    <div className="p-1">
                      {showRecentActivity ? (
                        <ChevronUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {!showRecentActivity && stats?.recentActivity?.length > 0 && (
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      stats.recentActivity[0].status === 'success' ? 'bg-green-500' :
                      stats.recentActivity[0].status === 'warning' ? 'bg-orange-500' :
                      stats.recentActivity[0].status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {stats.recentActivity[0].message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(stats.recentActivity[0].timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {stats.recentActivity.length > 1 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      +{stats.recentActivity.length - 1} more activities
                    </p>
                  )}
                </CardContent>
              )}

              {showRecentActivity && (
                <CardContent className="p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-orange-500' :
                          activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6">
                        <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-3 h-9" onClick={fetchDashboardData}>
                    <Eye className="w-4 h-4 mr-2" />
                    Refresh Activity
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Quick Actions - Right Side (3/6 width) */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 backdrop-blur-sm h-fit">
              <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-indigo-600 -m-6 mb-0 p-4">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Link href="/admin/users">
                  <Button className="w-full justify-start gap-2 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group text-sm">
                    <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Users className="w-3 h-3" />
                    </div>
                    <span className="font-medium">Manage Users</span>
                  </Button>
                </Link>
                <Link href="/admin/bookings">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10 border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20 transition-all duration-300 group text-sm">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                      <Calendar className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="font-medium text-green-700 dark:text-green-400">View Bookings</span>
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20 transition-all duration-300 group text-sm">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <BarChart3 className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="font-medium text-purple-700 dark:text-purple-400">Analytics</span>
                  </Button>
                </Link>
                <Link href="/admin/disputes">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/20 transition-all duration-300 group text-sm">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="font-medium text-orange-700 dark:text-orange-400">Disputes</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

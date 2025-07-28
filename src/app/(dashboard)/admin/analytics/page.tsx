"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useSession } from "@/hooks/use-session";
import {
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  RefreshCw,
  Download
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyUsers, setMonthlyUsers] = useState<any[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, earningsRes] = await Promise.all([
        axios.get("/api/admin/analytics/summary"),
        axios.get("/api/admin/analytics/monthly-users"),
        axios.get("/api/admin/analytics/monthly-earnings"),
      ]);
      setStats(statsRes.data);
      setMonthlyUsers(usersRes.data);
      setMonthlyEarnings(earningsRes.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </Card>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-80 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-muted-foreground text-lg">Platform insights and performance metrics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Students</p>
                    <p className="text-3xl font-bold">{stats?.totalStudents?.toLocaleString() ?? "-"}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Active learners</span>
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
                    <p className="text-green-100 text-sm font-medium">Tutors</p>
                    <p className="text-3xl font-bold">{stats?.totalTutors?.toLocaleString() ?? "-"}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Educators</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Sessions</p>
                    <p className="text-3xl font-bold">{stats?.totalBookings?.toLocaleString() ?? "-"}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Total bookings</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold">${stats?.totalRevenue?.toLocaleString() ?? "-"}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Platform earnings</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Monthly Active Users Chart */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <LineChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Monthly Active Users
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyUsers.map((m) => ({
                  month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
                  tutors: m.tutors,
                  students: m.students,
                }))}
              >
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" name="New Students" strokeWidth={3} />
                <Line type="monotone" dataKey="tutors" stroke="#10b981" name="New Tutors" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Earnings vs Payouts Chart */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Platform Earnings vs Tutor Payouts
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyEarnings.map((m) => ({
                  month: `${m.year}-${String(m.month).padStart(2, "0")}`,
                  revenue: m.totalPaid,
                  platform: m.platformEarnings,
                  tutors: m.tutorEarnings,
                }))}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="platform" fill="#6366f1" name="Platform (30%)" />
                <Bar dataKey="tutors" fill="#10b981" name="Tutors (70%)" />
                <Bar dataKey="revenue" fill="#f59e42" name="Total Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown Table */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Monthly Breakdown
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Platform (30%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tutors (70%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sessions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {monthlyEarnings.map((m) => (
                    <tr key={`${m.year}-${m.month}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {`${m.year}-${String(m.month).padStart(2, "0")}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                        ${m.totalPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 dark:text-purple-400 font-medium">
                        ${m.platformEarnings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                        ${m.tutorEarnings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {m.sessions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

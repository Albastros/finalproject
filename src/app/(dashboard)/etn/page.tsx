"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Users,
  CheckCircle,
  Activity,
  Calendar,
  ChevronUp,
  ChevronDown,
  Eye,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  tx_ref?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: string;
}

export default function ETNDashboard() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    totalPaymentReceived: 0,
    totalApproved: 0,
    totalRejected: 0
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch transactions for ETN
      let txns = [];
      try {
        const transactionsResponse = await axios.get(`/api/admin/transactions?etnId=${session?.user?.id}`);
        txns = transactionsResponse.data.transactions || [];
      } catch (transactionError) {
        console.log("Transactions endpoint not available, using empty array");
        txns = [];
      }
      setTransactions(txns);
      
      // Fetch all tutors (pending applications)
      let pendingTutors = [];
      try {
        const tutorsResponse = await axios.get("/api/etn/tutors");
        pendingTutors = tutorsResponse.data.tutors || [];
      } catch (etnError) {
        try {
          const tutorsResponse = await axios.get("/api/admin/tutors");
          pendingTutors = tutorsResponse.data.tutors || [];
        } catch (adminError) {
          console.log("No tutors endpoint available, using empty array");
          pendingTutors = [];
        }
      }
      
      // Fetch approved tutors
      let approvedTutors = [];
      try {
        const approvedResponse = await axios.get("/api/etn/tutors?verified=true");
        approvedTutors = approvedResponse.data.tutors || [];
      } catch (error) {
        console.log("Could not fetch approved tutors");
      }
      
      // Fetch rejected tutors
      let rejectedTutors = [];
      try {
        const rejectedResponse = await axios.get("/api/etn/tutors?rejected=true");
        rejectedTutors = rejectedResponse.data.tutors || [];
      } catch (error) {
        console.log("Could not fetch rejected tutors");
      }
      
      // Calculate stats
      const totalApplicants = pendingTutors.length + approvedTutors.length + rejectedTutors.length;
      const totalPaymentReceived = txns
        .filter((tx: Transaction) => tx.status === 'completed')
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      const totalApproved = approvedTutors.length;
      const totalRejected = rejectedTutors.length;
      
      // Generate recent activities
      const recentActivity: RecentActivity[] = [];
      
      // Add recent payments
      const recentPayments = txns
        .filter((tx: Transaction) => tx.status === 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      recentPayments.forEach((payment) => {
        recentActivity.push({
          id: `payment-${payment._id}`,
          type: 'payment',
          message: `Payment received: ${payment.amount} birr`,
          timestamp: payment.createdAt,
          status: 'success'
        });
      });

      // Add recent tutor applications from pending tutors only
      if (pendingTutors.length > 0) {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const recentTutors = pendingTutors
          .filter((t: any) => t.createdAt && new Date(t.createdAt) > twoHoursAgo)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        recentTutors.forEach((tutor: any) => {
          recentActivity.push({
            id: `tutor-${tutor._id}`,
            type: 'application',
            message: `New tutor application: ${tutor.name}`,
            timestamp: tutor.createdAt,
            status: 'info'
          });
        });
      }

      // Sort all activities by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Set all data
      setStats({ 
        totalApplicants,
        totalPaymentReceived,
        totalApproved,
        totalRejected
      });
      setRecentActivities(recentActivity.slice(0, 5));
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshActivities = async () => {
    try {
      // Fetch fresh data
      let txns = [];
      try {
        const transactionsResponse = await axios.get(`/api/admin/transactions?etnId=${session?.user?.id}`);
        txns = transactionsResponse.data.transactions || [];
      } catch (transactionError) {
        console.log("Transactions endpoint not available, using empty array");
        txns = [];
      }
      
      let tutors = [];
      try {
        const tutorsResponse = await axios.get("/api/etn/tutors");
        tutors = tutorsResponse.data.tutors || [];
      } catch (etnError) {
        try {
          const tutorsResponse = await axios.get("/api/admin/tutors");
          tutors = tutorsResponse.data.tutors || [];
        } catch (adminError) {
          console.log("No tutors endpoint available, using empty array");
          tutors = [];
        }
      }

      // Generate fresh activities
      const activities: RecentActivity[] = [];
      
      // Add recent payments
      const recentPayments = txns
        .filter((tx: Transaction) => tx.status === 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      recentPayments.forEach((payment) => {
        activities.push({
          id: `payment-${payment._id}`,
          type: 'payment',
          message: `Payment received: ${payment.amount} birr`,
          timestamp: payment.createdAt,
          status: 'success'
        });
      });

      // Add recent tutor applications
      if (tutors.length > 0) {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
        const recentTutors = tutors
          .filter((t: any) => t.createdAt && new Date(t.createdAt) > twoHoursAgo)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        recentTutors.forEach((tutor: any) => {
          activities.push({
            id: `tutor-${tutor._id}`,
            type: 'application',
            message: `New tutor application: ${tutor.name}`,
            timestamp: tutor.createdAt,
            status: 'info'
          });
        });
      }

      // Sort and update activities
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 5));
      
    } catch (error) {
      console.error("Failed to refresh activities:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ETN Dashboard</h1>
        <p className="text-muted-foreground">Track your payments and tutor applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Applicants</p>
                <p className="text-3xl font-bold">{stats.totalApplicants}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Payment Received</p>
                <p className="text-3xl font-bold">{stats.totalPaymentReceived} birr</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Approved</p>
                <p className="text-3xl font-bold">{stats.totalApproved}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Rejected</p>
                <p className="text-3xl font-bold">{stats.totalRejected}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-fit">
          <CardHeader 
            className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-4 cursor-pointer hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200"
            onClick={() => setShowRecentActivity(!showRecentActivity)}
          >
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex-1">
                Recent Activities
              </CardTitle>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                  {recentActivities?.length || 0}
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
          
          {!showRecentActivity && recentActivities?.length > 0 && (
            <CardContent className="p-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  recentActivities[0].status === 'success' ? 'bg-green-500' :
                  recentActivities[0].status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {recentActivities[0].message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(recentActivities[0].timestamp), "MMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
            </CardContent>
          )}

          {showRecentActivity && (
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {recentActivities?.length > 0 ? recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.timestamp), "MMM dd, yyyy 'at' HH:mm")}
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

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="font-medium text-green-600">{transaction.amount} birr</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className={transaction.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
 
               ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



































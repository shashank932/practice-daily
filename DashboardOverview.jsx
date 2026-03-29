import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, ShieldAlert, Users, Loader2 } from "lucide-react";
import { dashboardAPI, transactionAPI } from "@/services/api"; // ✅ Use centralized API service

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Merged both fetches into one coordinated function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, usersRes, txRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentUsers(),
        transactionAPI.getMyTransactions(), // ✅ Use API service instead of raw axios with hardcoded URL
      ]);

      setStats(statsRes.stats);
      setRecentUsers(usersRes.users || []);
      setTransactions(txRes.data || txRes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-slate-500">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-red-100 rounded text-sm font-medium hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const highRiskCount = transactions.filter((t) => t.risk === "HIGH").length;

  const statCards = [
    {
      title: "Total Transactions (24h)",
      value: transactions.length,
      icon: <CreditCard className="h-4 w-4 text-slate-500" />,
      trend: "Live transactions count",
    },
    {
      title: "Flagged Frauds",
      value: highRiskCount,
      icon: <ShieldAlert className="h-4 w-4 text-red-500" />,
      trend: "High risk detected",
    },
    {
      title: "Active AI Models",
      value: stats?.activeModels ?? 1, // ✅ Use stats if available
      icon: <Activity className="h-4 w-4 text-blue-500" />,
      trend: "Model running",
    },
    {
      title: "System Users",
      value: stats?.totalUsers ?? recentUsers.length, // ✅ Prefer stats total over list length
      icon: <Users className="h-4 w-4 text-slate-500" />,
      trend: "Live users count",
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-300">Welcome back. Here is what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
              <p className="text-xs text-slate-300 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg mt-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-slate-300">No transactions found</p>
          ) : (
            transactions.map((t, index) => (
              <div
                key={t._id || t.id || index} // ✅ index as last-resort fallback
                className={`flex justify-between border-b border-white/20 py-2 ${
                  t.risk === "HIGH" ? "bg-red-500/10" : ""
                }`}
              >
                <span className="text-white">{t.user || "User"}</span>
                <span
                  className={`font-semibold ${
                    t.risk === "HIGH" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  ₹{t.amount}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

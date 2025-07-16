
import React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, Briefcase, UserCheck, TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
  // Fetch analytics data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Mock data for charts - in a real app, this would come from the API
  const roleDistribution = [
    { name: "Recruiters", value: 5, color: "#8884d8" },
    { name: "Hiring Managers", value: 3, color: "#82ca9d" },
    { name: "Admins", value: 1, color: "#ffc658" },
  ];

  const monthlyActivity = [
    { month: "Jan", users: 8, jobs: 12, applicants: 45 },
    { month: "Feb", users: 9, jobs: 15, applicants: 52 },
    { month: "Mar", users: 9, jobs: 18, applicants: 68 },
    { month: "Apr", users: 9, jobs: 20, applicants: 75 },
    { month: "May", users: 9, jobs: 22, applicants: 82 },
    { month: "Jun", users: 9, jobs: 25, applicants: 95 },
  ];

  const jobStatusData = [
    { status: "Open", count: 15 },
    { status: "In Progress", count: 8 },
    { status: "Closed", count: 5 },
    { status: "On Hold", count: 2 },
  ];

  return (
    <DashboardLayout title="Analytics">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={statsLoading ? "..." : stats?.totalUsers || 0}
          icon={<Users />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
          trend={{
            value: 12,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Open Jobs"
          value={statsLoading ? "..." : stats?.openJobs || 0}
          icon={<Briefcase />}
          iconBgColor="bg-green-100"
          iconColor="text-green-500"
          trend={{
            value: 8,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Active Recruiters"
          value={statsLoading ? "..." : stats?.activeRecruiters || 0}
          icon={<UserCheck />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
          trend={{
            value: 5,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Total Applicants"
          value={statsLoading ? "..." : stats?.totalApplicants || 0}
          icon={<TrendingUp />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-500"
          trend={{
            value: 15,
            isUpward: true,
            label: "from last month",
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Distribution of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>Current status of all jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity Trend */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monthly Activity Trends</CardTitle>
          <CardDescription>User growth, job postings, and applicant activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" name="Users" />
              <Line type="monotone" dataKey="jobs" stroke="#82ca9d" name="Jobs" />
              <Line type="monotone" dataKey="applicants" stroke="#ffc658" name="Applicants" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { JobRequirement, User } from "@shared/schema";
import { Briefcase, UserCheck, UserPlus, Edit, Trash, UserPlus2 } from "lucide-react";

export default function HiringManagerDashboard() {
  const { user } = useAuth();
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch jobs for the hiring manager
  const { data: jobs, isLoading: jobsLoading } = useQuery<JobRequirement[]>({
    queryKey: ["/api/jobs"],
  });

  const jobColumns = [
    {
      key: "title",
      header: "Job Title",
      render: (job: JobRequirement) => (
        <div className="text-sm font-medium text-gray-900">{job.title}</div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (job: JobRequirement) => (
        <div className="text-sm text-gray-500">{job.department}</div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (job: JobRequirement) => (
        <div className="text-sm text-gray-500">{job.location}</div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (job: JobRequirement) => (
        <div className="flex items-center">
          <Avatar 
            initials="SL" 
            size="sm"
            className="mr-2"
          />
          <div className="text-sm text-gray-500">Assigned Recruiter</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (job: JobRequirement) => {
        const statusColor = 
          job.status === "active" ? "success" :
          job.status === "draft" ? "warning" :
          job.status === "on_hold" ? "purple" :
          job.status === "filled" ? "info" : "gray";
          
        const statusText = job.status
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
          
        return <Badge variant={statusColor}>{statusText}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (job: JobRequirement) => (
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <UserPlus2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Hiring Manager Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="My Job Postings"
          value={statsLoading ? "..." : stats?.myJobPostings || 0}
          icon={<Briefcase />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
          trend={{
            value: 3,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Assigned Recruiters"
          value={statsLoading ? "..." : stats?.assignedRecruiters || 0}
          icon={<UserCheck />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
          trend={{
            value: 2,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Total Applicants"
          value={statsLoading ? "..." : stats?.totalApplicants || 0}
          icon={<UserPlus />}
          iconBgColor="bg-green-100"
          iconColor="text-green-500"
          trend={{
            value: 18,
            isUpward: true,
            label: "from last month",
          }}
        />
      </div>

      {/* Job Requirements Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Job Requirements</h2>
          <Link href="/hiring-manager/job-requirements">
            <Button className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4" /> Manage Jobs
            </Button>
          </Link>
        </div>

        {/* Jobs table */}
        <DataTable
          data={jobs || []}
          columns={jobColumns}
          keyExtractor={(job) => job.id}
          isLoading={jobsLoading}
          footer={
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">
                    {jobs?.length || 0}
                  </span>{" "}
                  of <span className="font-medium">{jobs?.length || 0}</span>{" "}
                  results
                </p>
              </div>
              <Link href="/hiring-manager/job-requirements">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}

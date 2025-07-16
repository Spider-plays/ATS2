import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import UserManagement from "@/components/admin/user-management";
import HiringManagerJobs from "@/components/hiring-manager/job-requirements";
import JobRequirements from "@/components/recruiter/job-requirements";
import RecentApplicants from "@/components/recruiter/recent-applicants";
import PipelineView from "@/components/recruiter/pipeline-view";
import ApplicantsList from "@/components/recruiter/applicants-list";
import { Loader2 } from "lucide-react";

export type DashboardSection = 
  | "dashboard" 
  | "users" 
  | "analytics" 
  | "settings"
  | "jobs"
  | "recruiters"
  | "reports"
  | "requirements"
  | "applicants"
  | "pipeline";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'requirements' | 'applicants'>('requirements');

  // Fetch stats based on user role
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  // Set default section based on role
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setActiveSection("dashboard");
      } else if (user.role === "hiring_manager") {
        setActiveSection("jobs");
      } else if (user.role === "recruiter") {
        setActiveSection("requirements");
      }
    }
  }, [user]);

  // Handle view applicants for a specific job
  const handleViewApplicants = (jobId: number) => {
    setSelectedJobId(jobId);
    setViewMode('applicants');
  };

  // Handle back to requirements
  const handleBackToRequirements = () => {
    setSelectedJobId(null);
    setViewMode('requirements');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} 
          user={user}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 overflow-x-hidden">
          {isStatsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Admin Content */}
              {user.role === "admin" && (
                <>
                  {activeSection === "dashboard" && (
                    <div className="space-y-8">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                          title="Total Users" 
                          value={stats?.totalUsers || 0} 
                          icon="users" 
                          color="blue" 
                          change={{ value: 12, type: "increase" }}
                        />
                        <StatCard 
                          title="Open Jobs" 
                          value={stats?.openJobs || 0} 
                          icon="briefcase" 
                          color="green" 
                          change={{ value: 8, type: "increase" }}
                        />
                        <StatCard 
                          title="Active Recruiters" 
                          value={stats?.activeRecruiters || 0} 
                          icon="user-tie" 
                          color="purple" 
                          change={{ value: 5, type: "increase" }}
                        />
                        <StatCard 
                          title="Total Applicants" 
                          value={stats?.totalApplicants || 0} 
                          icon="user-plus" 
                          color="amber" 
                          change={{ value: 3, type: "decrease" }}
                        />
                      </div>

                      {/* User Management */}
                      <UserManagement />
                    </div>
                  )}

                  {activeSection === "users" && <UserManagement />}
                </>
              )}

              {/* Hiring Manager Content */}
              {user.role === "hiring_manager" && (
                <>
                  {activeSection === "dashboard" && (
                    <div className="space-y-8">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                          title="My Job Postings" 
                          value={stats?.myJobPostings || 0} 
                          icon="briefcase" 
                          color="purple" 
                          change={{ value: 3, type: "increase" }}
                        />
                        <StatCard 
                          title="Assigned Recruiters" 
                          value={stats?.assignedRecruiters || 0} 
                          icon="user-tie" 
                          color="blue" 
                          change={{ value: 2, type: "increase" }}
                        />
                        <StatCard 
                          title="Total Applicants" 
                          value={stats?.totalApplicants || 0} 
                          icon="user-plus" 
                          color="green" 
                          change={{ value: 18, type: "increase" }}
                        />
                      </div>

                      {/* Job Requirements */}
                      {viewMode === 'requirements' ? (
                        <HiringManagerJobs onViewApplicants={handleViewApplicants} />
                      ) : (
                        <ApplicantsList 
                          selectedJobId={selectedJobId!} 
                          onBack={handleBackToRequirements} 
                        />
                      )}
                    </div>
                  )}

                  {activeSection === "jobs" && (
                    viewMode === 'requirements' ? (
                      <HiringManagerJobs onViewApplicants={handleViewApplicants} />
                    ) : (
                      <ApplicantsList 
                        selectedJobId={selectedJobId!} 
                        onBack={handleBackToRequirements} 
                      />
                    )
                  )}
                </>
              )}

              {/* Recruiter Content */}
              {user.role === "recruiter" && (
                <>
                  {activeSection === "dashboard" && (
                    <div className="space-y-8">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                          title="Assigned Jobs" 
                          value={stats?.assignedJobs || 0} 
                          icon="briefcase" 
                          color="blue"
                        />
                        <StatCard 
                          title="Active Applicants" 
                          value={stats?.activeApplicants || 0} 
                          icon="user-plus" 
                          color="green"
                        />
                        <StatCard 
                          title="Interviews Scheduled" 
                          value={stats?.interviewsScheduled || 0} 
                          icon="calendar-check" 
                          color="purple"
                        />
                      </div>

                      {/* Job Requirements */}
                      {viewMode === 'requirements' ? (
                        <JobRequirements onSelectJob={handleViewApplicants} />
                      ) : (
                        <ApplicantsList 
                          selectedJobId={selectedJobId!} 
                          onBack={handleBackToRequirements} 
                        />
                      )}

                      {/* Recent Applicants */}
                      {viewMode === 'requirements' && <RecentApplicants />}
                    </div>
                  )}

                  {activeSection === "requirements" && (
                    viewMode === 'requirements' ? (
                      <JobRequirements onSelectJob={handleViewApplicants} />
                    ) : (
                      <ApplicantsList 
                        selectedJobId={selectedJobId!} 
                        onBack={handleBackToRequirements} 
                      />
                    )
                  )}
                  {activeSection === "applicants" && <RecentApplicants />}
                  {activeSection === "pipeline" && <PipelineView />}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Live Dashboard - Real-time Activity Feed */}
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "green" | "purple" | "amber" | "red";
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
};

function StatCard({ title, value, icon, color, change }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-500",
    green: "bg-green-100 text-green-500",
    purple: "bg-purple-100 text-purple-500",
    amber: "bg-amber-100 text-amber-500",
    red: "bg-red-100 text-red-500",
  };

  const iconMap: Record<string, string> = {
    "users": "fas fa-users",
    "briefcase": "fas fa-briefcase",
    "user-tie": "fas fa-user-tie",
    "user-plus": "fas fa-user-plus",
    "calendar-check": "fas fa-calendar-check",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${colorMap[color]} flex items-center justify-center`}>
          <i className={iconMap[icon]}></i>
        </div>
      </div>
      {change && (
        <div className="mt-3">
          <span className={change.type === "increase" ? "text-green-500 text-sm font-medium" : "text-red-500 text-sm font-medium"}>
            <i className={change.type === "increase" ? "fas fa-arrow-up" : "fas fa-arrow-down"}></i> {change.value}%
          </span>
          <span className="text-gray-400 text-sm ml-1">from last month</span>
        </div>
      )}
    </div>
  );
}
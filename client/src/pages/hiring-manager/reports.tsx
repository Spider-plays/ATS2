
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job, Applicant, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  FileText
} from "lucide-react";

export default function HiringManagerReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedJob, setSelectedJob] = useState<string>("all");

  // Fetch jobs
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"]
  });

  // Fetch users (recruiters)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"]
  });

  const recruiters = users.filter(user => user.role === "recruiter");

  // Mock applicants data (you'll need to implement this API endpoint)
  const { data: allApplicants = [] } = useQuery<any[]>({
    queryKey: ["/api/applicants"],
    queryFn: async () => {
      // This would fetch all applicants for the hiring manager's jobs
      const promises = jobs.map(job => 
        fetch(`/api/jobs/${job.id}/applicants`, { credentials: "include" })
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: jobs.length > 0
  });

  // Calculate metrics
  const getJobMetrics = () => {
    const activeJobs = jobs.filter(job => job.status === "active").length;
    const filledJobs = jobs.filter(job => job.status === "filled").length;
    const totalApplications = allApplicants.length;
    const hiredCandidates = allApplicants.filter(app => app.status === "hired").length;

    return {
      activeJobs,
      filledJobs,
      totalApplications,
      hiredCandidates,
      fillRate: jobs.length > 0 ? ((filledJobs / jobs.length) * 100).toFixed(1) : "0",
      conversionRate: totalApplications > 0 ? ((hiredCandidates / totalApplications) * 100).toFixed(1) : "0"
    };
  };

  const getRecruiterPerformance = () => {
    return recruiters.map(recruiter => {
      const recruiterJobs = jobs.filter(job => job.recruiterId === recruiter.id);
      const recruiterApplicants = allApplicants.filter(app => 
        recruiterJobs.some(job => job.id === app.jobId)
      );
      const hired = recruiterApplicants.filter(app => app.status === "hired").length;

      return {
        recruiter,
        jobsAssigned: recruiterJobs.length,
        applicants: recruiterApplicants.length,
        hired,
        conversionRate: recruiterApplicants.length > 0 ? 
          ((hired / recruiterApplicants.length) * 100).toFixed(1) : "0"
      };
    });
  };

  const getStatusDistribution = () => {
    const statuses = [
      "new", "screening", "screening_selected", "technical_round", 
      "technical_selected", "hr_round", "hr_selected", "final_round", 
      "hired", "rejected"
    ];

    return statuses.map(status => ({
      status,
      count: allApplicants.filter(app => app.status === status).length,
      percentage: allApplicants.length > 0 ? 
        ((allApplicants.filter(app => app.status === status).length / allApplicants.length) * 100).toFixed(1) : "0"
    }));
  };

  const metrics = getJobMetrics();
  const recruiterPerformance = getRecruiterPerformance();
  const statusDistribution = getStatusDistribution();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      screening: "bg-yellow-100 text-yellow-800",
      technical_round: "bg-purple-100 text-purple-800",
      hr_round: "bg-indigo-100 text-indigo-800",
      final_round: "bg-orange-100 text-orange-800",
      hired: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "New",
      screening: "Screening",
      screening_selected: "Screening Selected",
      technical_round: "Technical Round",
      technical_selected: "Technical Selected", 
      hr_round: "HR Round",
      hr_selected: "HR Selected",
      final_round: "Final Round",
      hired: "Hired",
      rejected: "Rejected"
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Track hiring performance and recruiter metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600">{metrics.activeJobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">{metrics.totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hired</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-600">{metrics.hiredCandidates}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl md:text-3xl font-bold text-orange-600">{metrics.conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Application Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statusDistribution.filter(item => item.count > 0).map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                        <span className="text-sm text-gray-600">{item.count} candidates</span>
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Status Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Jobs</span>
                      <span className="font-medium">{metrics.activeJobs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Filled Jobs</span>
                      <span className="font-medium">{metrics.filledJobs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fill Rate</span>
                      <Badge variant="secondary">{metrics.fillRate}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recruiters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recruiter Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruiterPerformance.map((perf) => (
                    <div key={perf.recruiter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {perf.recruiter.firstName} {perf.recruiter.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">@{perf.recruiter.username}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                          <p className="text-lg font-bold text-blue-600">{perf.jobsAssigned}</p>
                          <p className="text-xs text-gray-500">Jobs</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{perf.applicants}</p>
                          <p className="text-xs text-gray-500">Applicants</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">{perf.conversionRate}%</p>
                          <p className="text-xs text-gray-500">Success Rate</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recruiterPerformance.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No recruiters assigned yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {statusDistribution.filter(item => item.count > 0).map((item) => (
                <Card key={item.status}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-sm text-gray-500">candidates ({item.percentage}%)</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-4 md:gap-6">
              {jobs.map((job) => {
                const jobApplicants = allApplicants.filter(app => app.jobId === job.id);
                const hired = jobApplicants.filter(app => app.status === "hired").length;
                const recruiter = recruiters.find(r => r.id === job.recruiterId);

                return (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <p className="text-sm text-gray-500">{job.department}</p>
                        </div>
                        <Badge variant={job.status === "active" ? "default" : "secondary"}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">{jobApplicants.length}</p>
                          <p className="text-xs text-gray-500">Total Applicants</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">{hired}</p>
                          <p className="text-xs text-gray-500">Hired</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-600">
                            {jobApplicants.length > 0 ? ((hired / jobApplicants.length) * 100).toFixed(1) : "0"}%
                          </p>
                          <p className="text-xs text-gray-500">Success Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {recruiter ? `${recruiter.firstName} ${recruiter.lastName}` : "Unassigned"}
                          </p>
                          <p className="text-xs text-gray-500">Recruiter</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

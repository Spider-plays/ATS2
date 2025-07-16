
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job, Applicant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import AddJobModal from "@/components/hiring-manager/add-job-modal";
import ApplicantsList from "@/components/recruiter/applicants-list";
import { 
  Briefcase, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Eye,
  Edit,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HiringManagerJobRequirements() {
  const { toast } = useToast();
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "applicants">("list");

  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"]
  });

  const handleViewApplicants = (jobId: number) => {
    setSelectedJobId(jobId);
    setViewMode("applicants");
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
    setViewMode("list");
  };

  const getJobStats = (jobId: number) => {
    // This would normally come from an API call
    return {
      totalApplicants: Math.floor(Math.random() * 50),
      newApplicants: Math.floor(Math.random() * 10),
      inProgress: Math.floor(Math.random() * 20),
      hired: Math.floor(Math.random() * 5)
    };
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800", 
      on_hold: "bg-yellow-100 text-yellow-800",
      filled: "bg-blue-100 text-blue-800",
      closed: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (viewMode === "applicants" && selectedJobId) {
    const selectedJob = jobs.find(job => job.id === selectedJobId);
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Applicants for {selectedJob?.title}
              </h1>
              <p className="text-gray-600">{selectedJob?.department}</p>
            </div>
          </div>
          <ApplicantsList selectedJobId={selectedJobId} onBack={handleBackToList} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Job Requirements</h1>
            <p className="text-gray-600 mt-1">Manage your job postings and track applications</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setIsAddJobModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
            <Badge variant="secondary" className="text-sm">
              {jobs.length} Total Jobs
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({jobs.filter(j => j.status === "active").length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({jobs.filter(j => j.status === "draft").length})</TabsTrigger>
            <TabsTrigger value="filled">Filled ({jobs.filter(j => j.status === "filled").length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({jobs.filter(j => j.status === "closed").length})</TabsTrigger>
          </TabsList>

          {["all", "active", "draft", "filled", "closed"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-6">
              <div className="grid gap-4 md:gap-6">
                {jobs
                  .filter(job => tabValue === "all" || job.status === tabValue)
                  .map((job) => {
                    const stats = getJobStats(job.id);
                    return (
                      <Card key={job.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl font-bold text-gray-900">
                                  {job.title}
                                </CardTitle>
                                <Badge className={getStatusColor(job.status)}>
                                  {job.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{job.department}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{job.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewApplicants(job.id)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Applicants
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-gray-700 line-clamp-3">{job.description}</p>
                            
                            {/* Job Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{stats.totalApplicants}</p>
                                <p className="text-xs text-gray-500">Total Applicants</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.newApplicants}</p>
                                <p className="text-xs text-gray-500">New Applications</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                                <p className="text-xs text-gray-500">In Progress</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{stats.hired}</p>
                                <p className="text-xs text-gray-500">Hired</p>
                              </div>
                            </div>

                            {/* Requirements Preview */}
                            {job.requirements && (
                              <div className="pt-4 border-t">
                                <h4 className="font-medium text-gray-900 mb-2">Key Requirements</h4>
                                <div className="flex flex-wrap gap-2">
                                  {job.requirements.split(',').slice(0, 5).map((req, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {req.trim()}
                                    </Badge>
                                  ))}
                                  {job.requirements.split(',').length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{job.requirements.split(',').length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                
                {jobs.filter(job => tabValue === "all" || job.status === tabValue).length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {tabValue === "all" ? "No jobs created yet" : `No ${tabValue} jobs`}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {tabValue === "all" 
                        ? "Create your first job posting to start receiving applications."
                        : `You don't have any ${tabValue} job postings at the moment.`
                      }
                    </p>
                    {tabValue === "all" && (
                      <Button
                        onClick={() => setIsAddJobModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Your First Job
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <AddJobModal
          isOpen={isAddJobModalOpen}
          onClose={() => setIsAddJobModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}

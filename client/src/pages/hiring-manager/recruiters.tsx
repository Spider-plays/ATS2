
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Job } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function HiringManagerRecruiters() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");

  // Fetch recruiters
  const { data: recruiters = [], isLoading: loadingRecruiters } = useQuery<User[]>({
    queryKey: ["/api/users"],
    select: (users) => users.filter(user => user.role === "recruiter")
  });

  // Fetch jobs created by this hiring manager
  const { data: jobs = [], isLoading: loadingJobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"]
  });

  // Assign recruiter to job mutation
  const assignRecruiterMutation = useMutation({
    mutationFn: async ({ jobId, recruiterId }: { jobId: number; recruiterId: number }) => {
      const response = await fetch(`/api/jobs/${jobId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiterId }),
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to assign recruiter");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success",
        description: "Recruiter assigned successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredRecruiters = recruiters.filter(recruiter =>
    recruiter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecruiterStats = (recruiterId: number) => {
    const assignedJobs = jobs.filter(job => job.recruiterId === recruiterId);
    return {
      assignedJobs: assignedJobs.length,
      activeJobs: assignedJobs.filter(job => job.status === "active").length
    };
  };

  const unassignedJobs = jobs.filter(job => !job.recruiterId);
  const assignedJobs = jobs.filter(job => job.recruiterId);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Recruiters</h1>
            <p className="text-gray-600 mt-1">Manage and assign recruiters to your job requirements</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Badge variant="secondary" className="text-sm">
              {recruiters.length} Total Recruiters
            </Badge>
            <Badge variant="outline" className="text-sm">
              {assignedJobs.length} Active Assignments
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">Job Assignments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search recruiters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredRecruiters.map((recruiter) => {
                const stats = getRecruiterStats(recruiter.id);
                return (
                  <Card key={recruiter.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold truncate">
                            {recruiter.firstName} {recruiter.lastName}
                          </CardTitle>
                          <p className="text-sm text-gray-500">@{recruiter.username}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{recruiter.username}@company.com</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{stats.assignedJobs}</p>
                          <p className="text-xs text-gray-500">Assigned Jobs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
                          <p className="text-xs text-gray-500">Active Jobs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Unassigned Jobs ({unassignedJobs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unassignedJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{job.title}</h4>
                        <p className="text-sm text-gray-500">{job.department}</p>
                      </div>
                      <Select
                        onValueChange={(value) => {
                          if (value !== "select") {
                            assignRecruiterMutation.mutate({
                              jobId: job.id,
                              recruiterId: parseInt(value)
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select...</SelectItem>
                          {recruiters.map((recruiter) => (
                            <SelectItem key={recruiter.id} value={recruiter.id.toString()}>
                              {recruiter.firstName} {recruiter.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {unassignedJobs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">All jobs are assigned</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Active Assignments ({assignedJobs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignedJobs.map((job) => {
                    const recruiter = recruiters.find(r => r.id === job.recruiterId);
                    return (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{job.title}</h4>
                          <p className="text-sm text-gray-500">
                            Assigned to: {recruiter?.firstName} {recruiter?.lastName}
                          </p>
                        </div>
                        <Badge variant={job.status === "active" ? "default" : "secondary"}>
                          {job.status}
                        </Badge>
                      </div>
                    );
                  })}
                  {assignedJobs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No active assignments</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {recruiters.map((recruiter) => {
                const stats = getRecruiterStats(recruiter.id);
                return (
                  <Card key={recruiter.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {recruiter.firstName} {recruiter.lastName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-blue-600">{stats.assignedJobs}</p>
                          <p className="text-xs text-gray-600">Total Jobs</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Briefcase className="h-6 w-6 text-green-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
                          <p className="text-xs text-gray-600">Active Jobs</p>
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

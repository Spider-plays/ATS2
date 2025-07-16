import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, UserPlus } from "lucide-react";
import RequirementDetails from "./requirement-details";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface RequirementsListProps {
  onViewApplicants?: (jobId: number) => void;
}

export default function RequirementsList({ onViewApplicants }: RequirementsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!user
  });

  // Filter jobs based on search term and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle view requirement details
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  
  const handleViewRequirement = (jobId: number) => {
    setSelectedJobId(jobId);
  };

  const handleCloseDetails = () => {
    setSelectedJobId(null);
  };

  // Handle view applicants
  const handleViewApplicants = (jobId: number) => {
    // Callback to parent component to show applicants for this job
    if (onViewApplicants) {
      onViewApplicants(jobId);
    }
  };

  // Calculate progress percentage for display
  const getProgressPercentage = (job: Job) => {
    // This would normally be calculated based on actual applicants data
    // For now, returning a random percentage between 20% and 90%
    return Math.floor(Math.random() * 70) + 20;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Requirements</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requirements..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        // Skeleton loader for requirements cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32 mt-2" />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full mt-1" />
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No requirements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No job requirements have been assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const progressPercentage = getProgressPercentage(job);
            
            return (
              <Card key={job.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{job.department} • {job.location}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <i className="fas fa-building text-gray-400 w-5"></i>
                        <span className="text-gray-600">Company Name</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-dollar-sign text-gray-400 w-5"></i>
                        <span className="text-gray-600">
                          {job.minSalary && job.maxSalary 
                            ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}`
                            : 'Salary not specified'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-calendar-alt text-gray-400 w-5"></i>
                        <span className="text-gray-600">
                          Posted on {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Applicants</span>
                        <span className="font-medium">
                          {/* This would be replaced with actual applicant count */}
                          {Math.floor(progressPercentage / 5)} / {Math.floor(progressPercentage / 3)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                    <Button 
                      variant="ghost" 
                      className="text-blue-500 hover:text-blue-700 p-0 h-auto font-medium"
                      onClick={() => handleViewRequirement(job.id)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-primary hover:text-blue-700 p-0 h-auto font-medium"
                      onClick={() => handleViewApplicants(job.id)}
                    >
                      Manage Applicants
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {selectedJobId && (
        <RequirementDetails
          jobId={selectedJobId}
          isOpen={true}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    "draft": "bg-yellow-100 text-yellow-800",
    "active": "bg-green-100 text-green-800",
    "on_hold": "bg-orange-100 text-orange-800",
    "filled": "bg-blue-100 text-blue-800",
    "closed": "bg-gray-100 text-gray-800"
  };

  const statusDisplay: Record<string, string> = {
    "draft": "Draft",
    "active": "Active",
    "on_hold": "On Hold",
    "filled": "Filled",
    "closed": "Closed"
  };

  return (
    <Badge 
      className={`px-2 py-1 text-xs font-semibold ${statusColors[status]}`} 
      variant="outline"
    >
      {statusDisplay[status]}
    </Badge>
  );
}

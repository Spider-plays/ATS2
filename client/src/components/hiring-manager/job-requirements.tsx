import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Edit, Trash2, UserCheck, Users, Eye, MapPin, DollarSign, Building, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AddJobModal from "./add-job-modal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";

interface JobRequirementsProps {
  onViewApplicants?: (jobId: number) => void;
}

export default function JobRequirements({ onViewApplicants }: JobRequirementsProps) {
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!user
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Job deleted",
        description: "Job requirement has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openEditModal = (job: Job) => {
    setSelectedJob(job);
    setIsEditJobModalOpen(true);
  };

  const openDetailsModal = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedJob(null);
  };

  const openDeleteDialog = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteJob = () => {
    if (selectedJob) {
      deleteJobMutation.mutate(selectedJob.id);
    }
  };

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

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Job Requirements</h2>
        <Button onClick={() => setIsAddJobModalOpen(true)}>
          <Briefcase className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Jobs table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading jobs...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.recruiterId ? (
                        <RecruiterBadge id={job.recruiterId} />
                      ) : (
                        <span className="text-sm text-gray-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDetailsModal(job)}
                        className="text-gray-500 hover:text-gray-700 mr-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewApplicants && onViewApplicants(job.id)}
                        className="text-green-500 hover:text-green-700 mr-1"
                        title="View Applicants"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditModal(job)}
                        className="text-blue-500 hover:text-blue-700 mr-1"
                        title="Edit Job"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {}} // TODO: Implement assign recruiter
                        className="text-gray-500 hover:text-gray-700 mr-1"
                        title="Assign Recruiter"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDeleteDialog(job)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Job Modal */}
      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        job={null}
      />
      
      {/* Edit Job Modal */}
      {selectedJob && (
        <AddJobModal
          isOpen={isEditJobModalOpen}
          onClose={() => setIsEditJobModalOpen(false)}
          job={selectedJob}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job:
              {selectedJob && ` ${selectedJob.title}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteJob}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// This would typically fetch the recruiter's details
function RecruiterBadge({ id }: { id: number }) {
  // In a real implementation, we would fetch the recruiter details
  // For now, just showing the ID
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
        <span>R</span>
      </div>
      <div className="ml-2 text-sm text-gray-500">Recruiter #{id}</div>
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
      className={`font-semibold ${statusColors[status]}`} 
      variant="outline"
    >
      {statusDisplay[status]}
    </Badge>
  );
}

// Job Details Modal Component
function JobDetailsModal({ job, isOpen, onClose }: { job: Job; isOpen: boolean; onClose: () => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'filled': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{job.title}</DialogTitle>
          <DialogDescription>
            Complete job details and requirements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Job Status</h3>
              <Badge className={getStatusColor(job.status)}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Posted Date</h3>
              <p className="text-sm text-gray-600">{formatDate(job.createdAt)}</p>
            </div>
          </div>

          {/* Location and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Department</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-2" />
                <span>{job.department}</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Location</h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{job.location}</span>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Salary Range</h3>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Job Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{job.requirements}</p>
          </div>

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Benefits</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{job.benefits}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

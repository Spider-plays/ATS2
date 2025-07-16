import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  Eye,
  Calendar,
  Building,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import RequirementDetails from "./requirement-details";

interface JobRequirementsProps {
  onSelectJob: (jobId: number) => void;
}

export default function JobRequirements({ onSelectJob }: JobRequirementsProps) {
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddApplicantOpen, setIsAddApplicantOpen] = useState(false);

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!user && user.role === "recruiter"
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  const handleAddApplicant = (job: Job) => {
    setSelectedJob(job);
    setIsAddApplicantOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedJob(null);
  };

  const handleCloseAddApplicant = () => {
    setIsAddApplicantOpen(false);
    setSelectedJob(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'filled': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Requirements</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage job requirements and add candidates
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="secondary" className="text-sm">
            {jobs.length} Active Requirements
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                  {job.title}
                </CardTitle>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {job.description}
                </p>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Requirements:</span> {job.requirements}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(job)}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSelectJob(job.id)}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Users className="h-4 w-4" />
                    View Candidates
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddApplicant(job)}
                  className="flex items-center gap-2 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add Applicant
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No job requirements found</h3>
          <p className="text-gray-500">
            Job requirements will appear here when they are assigned to you.
          </p>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      )}

      {/* Add Applicant Modal */}
      {selectedJob && (
        <RequirementDetails
          jobId={selectedJob.id}
          isOpen={isAddApplicantOpen}
          onClose={handleCloseAddApplicant}
        />
      )}
    </div>
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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'filled': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
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
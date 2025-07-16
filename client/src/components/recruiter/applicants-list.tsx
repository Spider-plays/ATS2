import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Applicant, Job } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Calendar, 
  XCircle, 
  Loader2,
  ArrowLeft,
  Users,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CandidateStatusManager from "@/components/shared/candidate-status-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mail,
  Phone,
  Building,
  User as UserIcon,
  Upload
} from "lucide-react"

interface ApplicantsListProps {
  selectedJobId?: number;
  onBack?: () => void;
}

export default function ApplicantsList({ selectedJobId, onBack }: ApplicantsListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<Applicant | null>(null);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);

  // Fetch applicants for a specific job or all recent applicants
  const { data: applicants = [], isLoading } = useQuery<Applicant[]>({
    queryKey: selectedJobId ? [`/api/jobs/${selectedJobId}/applicants`] : ["/api/recruiter/recent-applicants"],
    enabled: !!user && user.role === "recruiter"
  });

  // Fetch job details if we have a selectedJobId
  const { data: job } = useQuery<Job>({
    queryKey: [`/api/jobs/${selectedJobId}`],
    enabled: !!selectedJobId
  });

  // Handle manage candidate status
  const handleManageCandidate = (candidate: Applicant) => {
    setSelectedCandidate(candidate);
    setIsStatusManagerOpen(true);
  };

  // Handle close status manager
  const handleCloseStatusManager = () => {
    setIsStatusManagerOpen(false);
    setSelectedCandidate(null);
  };

  // Get job information (in a real implementation this would fetch from the API)
  const getJobInfo = (jobId: number) => {
    const jobTitles: Record<number, { title: string, company: string }> = {
      1: { title: "Senior Frontend Developer", company: "TechCorp Inc." },
      2: { title: "Product Manager", company: "InnovateCo" },
      3: { title: "DevOps Engineer", company: "CloudTech Systems" },
    };

    return jobTitles[jobId] || { title: `Job #${jobId}`, company: "Company" };
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "new": "bg-gray-100 text-gray-800",
      "screening": "bg-blue-100 text-blue-800",
      "screening_selected": "bg-green-100 text-green-800",
      "screening_rejected": "bg-red-100 text-red-800",
      "technical_round": "bg-purple-100 text-purple-800",
      "technical_selected": "bg-green-100 text-green-800",
      "technical_rejected": "bg-red-100 text-red-800",
      "hr_round": "bg-indigo-100 text-indigo-800",
      "hr_selected": "bg-green-100 text-green-800",
      "hr_rejected": "bg-red-100 text-red-800",
      "final_round": "bg-amber-100 text-amber-800",
      "hired": "bg-emerald-100 text-emerald-800",
      "rejected": "bg-red-100 text-red-800",
      "on_hold": "bg-yellow-100 text-yellow-800"
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = (status: string) => {
    const statusDisplay: Record<string, string> = {
      "new": "New",
      "screening": "Screening",
      "screening_selected": "Screening Selected",
      "screening_rejected": "Screening Rejected",
      "technical_round": "Technical Round",
      "technical_selected": "Technical Selected",
      "technical_rejected": "Technical Rejected",
      "hr_round": "HR Round",
      "hr_selected": "HR Selected",
      "hr_rejected": "HR Rejected",
      "final_round": "Final Round",
      "hired": "Hired",
      "rejected": "Rejected",
      "on_hold": "On Hold"
    };
    return statusDisplay[status] || "Unknown";
  };

  const getUploaderInfo = (applicant: Applicant) => {
    // In a real implementation, fetch uploader info from API
    return {
      firstName: "John",
      lastName: "Doe"
    };
  };

  const getChangeHistory = (applicant: Applicant) => {
    // In a real implementation, fetch change history from API
    return [
      {
        status: "screening",
        comment: "Initial screening completed",
        changedAt: new Date(),
        changedBy: {
          firstName: "Jane",
          lastName: "Smith"
        }
      },
      {
        status: "technical_round",
        comment: "Moved to technical round",
        changedAt: new Date(),
        changedBy: {
          firstName: "Jane",
          lastName: "Smith"
        }
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {onBack && (
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {selectedJobId && job ? `Applicants for ${job.title}` : "All Applicants"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {selectedJobId && job
              ? `Manage applicants for ${job.title} position`
              : "Manage all applicants across your job requirements"
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="secondary" className="text-sm">
            {applicants.length} Applicants
          </Badge>
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants yet</h3>
          <p className="text-gray-500">
            {selectedJobId
              ? "No one has applied to this job yet. Applications will appear here when candidates apply."
              : "You don't have any applicants across your job requirements yet."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-6">
          {applicants.map((applicant) => {
            const uploader = getUploaderInfo(applicant);
            const history = getChangeHistory(applicant);

            return (
              <Card key={applicant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">
                          {applicant.firstName} {applicant.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          Applied {formatDate(applicant.createdAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Upload className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Added by {uploader.firstName} {uploader.lastName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Badge className={getStatusColor(applicant.status)}>
                        {getStatusDisplay(applicant.status)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageCandidate(applicant)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="history">History ({history.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{applicant.email}</span>
                        </div>
                        {applicant.phoneNumber && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{applicant.phoneNumber}</span>
                          </div>
                        )}
                        {applicant.currentCompany && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{applicant.currentCompany}</span>
                          </div>
                        )}
                      </div>

                      {applicant.experience && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Experience</h4>
                          <p className="text-sm text-gray-600">{applicant.experience}</p>
                        </div>
                      )}

                      {applicant.notes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                          <p className="text-sm text-gray-600">{applicant.notes}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                      <ScrollArea className="h-48">
                        <div className="space-y-3">
                          {history.map((entry, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <Badge className={getStatusColor(entry.status)} size="sm">
                                    {getStatusDisplay(entry.status)}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(entry.changedAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{entry.comment}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  by {entry.changedBy.firstName} {entry.changedBy.lastName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Candidate Status Manager */}
      {selectedCandidate && (
        <CandidateStatusManager
          candidate={selectedCandidate}
          isOpen={isStatusManagerOpen}
          onClose={handleCloseStatusManager}
          jobId={selectedCandidate.jobId}
        />
      )}
    </div>
  );
}
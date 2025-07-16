import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Applicant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  DollarSign,
  Settings,
  FileText,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import CandidateStatusManager from "@/components/shared/candidate-status-manager";

export default function RecentApplicants() {
  const { user } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<Applicant | null>(null);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);

  const { data: applicants = [], isLoading } = useQuery<Applicant[]>({
    queryKey: ["/api/recruiter/recent-applicants"],
    enabled: !!user && user.role === "recruiter"
  });

  const handleManageCandidate = (candidate: Applicant) => {
    setSelectedCandidate(candidate);
    setIsStatusManagerOpen(true);
  };

  const handleCloseStatusManager = () => {
    setIsStatusManagerOpen(false);
    setSelectedCandidate(null);
  };

  const getStatusColor = (status: string) => {
    if (status.includes('rejected')) return 'bg-red-100 text-red-800';
    if (status.includes('selected') || status === 'hired') return 'bg-green-100 text-green-800';
    if (status === 'on_hold') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'new': 'New',
      'screening': 'Screening',
      'screening_selected': 'Screening Selected',
      'screening_rejected': 'Screening Rejected',
      'technical_round': 'Technical Round',
      'technical_selected': 'Technical Selected',
      'technical_rejected': 'Technical Rejected',
      'hr_round': 'HR Round',
      'hr_selected': 'HR Selected',
      'hr_rejected': 'HR Rejected',
      'final_round': 'Final Round',
      'hired': 'Hired',
      'rejected': 'Rejected',
      'on_hold': 'On Hold'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
          <h2 className="text-2xl font-bold text-gray-900">Recent Applicants</h2>
          <p className="mt-1 text-sm text-gray-600">
            Recently added candidates across all your job requirements
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="secondary" className="text-sm">
            {applicants.length} Recent Applicants
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applicants.map((applicant) => (
          <Card key={applicant.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {applicant.firstName} {applicant.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">Applied {formatDate(applicant.createdAt)}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(applicant.status)}>
                  {getStatusDisplay(applicant.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{applicant.email}</span>
                </div>
                {applicant.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{applicant.phoneNumber}</span>
                  </div>
                )}
                {applicant.currentCompany && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="truncate">{applicant.currentCompany}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {applicant.totalExperience && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{applicant.totalExperience}</span>
                  </div>
                )}
                {applicant.expectedCtc && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="truncate">{applicant.expectedCtc}</span>
                  </div>
                )}
              </div>

              {applicant.resume && (
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  <a 
                    href={applicant.resume} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    View Resume
                  </a>
                </div>
              )}

              {applicant.notes && (
                <div className="text-sm text-gray-600">
                  <p className="line-clamp-2">{applicant.notes}</p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageCandidate(applicant)}
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applicants.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent applicants</h3>
          <p className="text-gray-500">
            Recent applicants will appear here when candidates apply to your job requirements.
          </p>
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
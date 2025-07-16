import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Applicant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import CandidateStatusManager from "@/components/shared/candidate-status-manager";

export default function PipelineView() {
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

  // Filter candidates by pipeline stage
  const pipelineStages = [
    { key: 'new', label: 'New Applications', color: 'bg-gray-100 text-gray-800' },
    { key: 'screening', label: 'Screening', color: 'bg-blue-100 text-blue-800' },
    { key: 'technical', label: 'Technical Round', color: 'bg-purple-100 text-purple-800' },
    { key: 'hr', label: 'HR Round', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'final', label: 'Final Round', color: 'bg-amber-100 text-amber-800' },
    { key: 'hired', label: 'Hired', color: 'bg-green-100 text-green-800' }
  ];

  const getCandidatesByStage = (stage: string) => {
    switch (stage) {
      case 'new':
        return applicants.filter(a => a.status === 'new');
      case 'screening':
        return applicants.filter(a => a.status === 'screening' || a.status === 'screening_selected');
      case 'technical':
        return applicants.filter(a => a.status === 'technical_round' || a.status === 'technical_selected');
      case 'hr':
        return applicants.filter(a => a.status === 'hr_round' || a.status === 'hr_selected');
      case 'final':
        return applicants.filter(a => a.status === 'final_round');
      case 'hired':
        return applicants.filter(a => a.status === 'hired');
      default:
        return [];
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('rejected')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status.includes('selected') || status === 'hired') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
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
          <h2 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h2>
          <p className="mt-1 text-sm text-gray-600">
            Track candidates through the hiring process
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="secondary" className="text-sm">
            {applicants.length} Total Candidates
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {pipelineStages.map((stage) => {
          const candidates = getCandidatesByStage(stage.key);
          
          return (
            <Card key={stage.key} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {stage.label}
                  </CardTitle>
                  <Badge className={stage.color}>
                    {candidates.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {candidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No candidates in this stage</p>
                  </div>
                ) : (
                  candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {candidate.firstName} {candidate.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{candidate.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(candidate.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Applied: {formatDate(candidate.createdAt)}</span>
                        {candidate.currentCompany && (
                          <span className="truncate ml-2">{candidate.currentCompany}</span>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageCandidate(candidate)}
                        className="w-full flex items-center gap-2 text-xs"
                      >
                        <Settings className="h-3 w-3" />
                        Manage
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {applicants.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates in pipeline</h3>
          <p className="text-gray-500">
            Candidates will appear here as they progress through the hiring process.
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
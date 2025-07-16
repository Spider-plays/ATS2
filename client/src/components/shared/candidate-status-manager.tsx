import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Applicant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Building,
  Calendar,
  DollarSign,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface CandidateStatusManagerProps {
  candidate: Applicant;
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
}

const statusFlow = [
  { key: 'new', label: 'New', next: ['screening'] },
  { key: 'screening', label: 'Screening', next: ['screening_selected', 'screening_rejected'] },
  { key: 'screening_selected', label: 'Screening Selected', next: ['technical_round'] },
  { key: 'screening_rejected', label: 'Screening Rejected', next: [] },
  { key: 'technical_round', label: 'Technical Round', next: ['technical_selected', 'technical_rejected'] },
  { key: 'technical_selected', label: 'Technical Selected', next: ['hr_round'] },
  { key: 'technical_rejected', label: 'Technical Rejected', next: [] },
  { key: 'hr_round', label: 'HR Round', next: ['hr_selected', 'hr_rejected'] },
  { key: 'hr_selected', label: 'HR Selected', next: ['final_round'] },
  { key: 'hr_rejected', label: 'HR Rejected', next: [] },
  { key: 'final_round', label: 'Final Round', next: ['hired', 'rejected'] },
  { key: 'hired', label: 'Hired', next: [] },
  { key: 'rejected', label: 'Rejected', next: [] },
  { key: 'on_hold', label: 'On Hold', next: [] },
];

export default function CandidateStatusManager({ 
  candidate, 
  isOpen, 
  onClose, 
  jobId 
}: CandidateStatusManagerProps) {
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const { toast } = useToast();

  const currentStatus = statusFlow.find(s => s.key === candidate.status);
  const nextStatuses = currentStatus?.next || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      const response = await fetch(`/api/applicants/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/applicants`] });
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter/recent-applicants"] });
      toast({
        title: "Status Updated",
        description: "Candidate status has been updated successfully"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive"
      });
    }
  });

  const handleStatusUpdate = (newStatus: string) => {
    setSelectedStatus(newStatus);
    updateStatusMutation.mutate({ status: newStatus, notes });
  };

  const getStatusBadgeColor = (status: string) => {
    if (status.includes('rejected')) return 'destructive';
    if (status.includes('selected') || status === 'hired') return 'success';
    if (status === 'on_hold') return 'warning';
    return 'secondary';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('rejected')) return <XCircle className="h-4 w-4" />;
    if (status.includes('selected') || status === 'hired') return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate Status Management</DialogTitle>
          <DialogDescription>
            Update candidate status and add notes about the hiring process
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {candidate.firstName} {candidate.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{candidate.email}</span>
                  </div>
                  {candidate.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{candidate.phoneNumber}</span>
                    </div>
                  )}
                  {candidate.currentCompany && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{candidate.currentCompany}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {candidate.totalExperience && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Experience: {candidate.totalExperience}</span>
                    </div>
                  )}
                  {candidate.currentCtc && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Current: {candidate.currentCtc}</span>
                    </div>
                  )}
                  {candidate.expectedCtc && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Expected: {candidate.expectedCtc}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {candidate.resume && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <a 
                    href={candidate.resume} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(candidate.status)}
                <Badge variant={getStatusBadgeColor(candidate.status)}>
                  {currentStatus?.label || candidate.status}
                </Badge>
              </div>
              {candidate.notes && (
                <div className="mt-4">
                  <Label>Previous Notes:</Label>
                  <p className="text-sm text-gray-600 mt-1">{candidate.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Actions */}
          {nextStatuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {nextStatuses.map((statusKey) => {
                    const statusInfo = statusFlow.find(s => s.key === statusKey);
                    if (!statusInfo) return null;
                    
                    const isReject = statusKey.includes('rejected');
                    const isSelect = statusKey.includes('selected') || statusKey === 'hired';
                    
                    return (
                      <Button
                        key={statusKey}
                        variant={isReject ? "destructive" : isSelect ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusUpdate(statusKey)}
                        disabled={updateStatusMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {getStatusIcon(statusKey)}
                        {statusInfo.label}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Add Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the interview or assessment..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleStatusUpdate('on_hold')}
              disabled={updateStatusMutation.isPending}
            >
              Put On Hold
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
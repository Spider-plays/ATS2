
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Job, Applicant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";

const applicantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  currentCompany: z.string().optional(),
  noticePeriod: z.string().optional(),
  totalExperience: z.string().optional(),
  relevantExperience: z.string().optional(),
  currentCtc: z.string().optional(),
  expectedCtc: z.string().optional(),
  resume: z.string().optional(),
  notes: z.string().optional()
});

type ApplicantFormData = z.infer<typeof applicantSchema>;

interface RequirementDetailsProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function RequirementDetails({ jobId, isOpen, onClose }: RequirementDetailsProps) {
  const { toast } = useToast();
  const form = useForm<ApplicantFormData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      currentCompany: "",
      noticePeriod: "",
      totalExperience: "",
      relevantExperience: "",
      currentCtc: "",
      expectedCtc: "",
      resume: "",
      notes: ""
    }
  });

  const { data: job } = useQuery<Job>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: isOpen
  });

  const addApplicantMutation = useMutation({
    mutationFn: async (data: ApplicantFormData) => {
      const response = await fetch(`/api/jobs/${jobId}/applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add applicant');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/applicants`] });
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter/recent-applicants"] });
      toast({
        title: "Success",
        description: "Applicant profile added successfully"
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add applicant profile",
        variant: "destructive"
      });
    }
  });

  // Reset form when modal is closed
  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: ApplicantFormData) => {
    addApplicantMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job?.title} - Add Applicant Profile</DialogTitle>
          <DialogDescription>
            Fill in the candidate information to add them to this job requirement.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Job Details</h3>
          <p className="text-sm text-gray-600 mb-1">Department: {job?.department}</p>
          <p className="text-sm text-gray-600 mb-1">Location: {job?.location}</p>
          <p className="text-sm text-gray-600 mb-4">Requirements: {job?.requirements}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Personal Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Professional Information</h4>
              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Company</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Current employer" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Experience</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 3 years" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relevantExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relevant Experience</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2 years" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentCtc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current CTC</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., $80,000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedCtc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected CTC</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., $90,000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="noticePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Period</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 30 days" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Resume & Notes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Additional Information</h4>
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Link to resume or portfolio" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Add any relevant notes about the candidate" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={addApplicantMutation.isPending}>
                {addApplicantMutation.isPending ? "Adding..." : "Add Candidate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

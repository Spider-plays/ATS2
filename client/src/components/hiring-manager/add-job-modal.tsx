import { useEffect } from "react";
import { Job, insertJobSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Create a customized schema for the form
const jobFormSchema = insertJobSchema
  .omit({ hiringManagerId: true, createdAt: true, updatedAt: true })
  .extend({
    minSalary: z.coerce.number().min(0).optional(),
    maxSalary: z.coerce.number().min(0).optional(),
  })
  .refine(data => {
    if (data.minSalary && data.maxSalary) {
      return data.maxSalary >= data.minSalary;
    }
    return true;
  }, {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["maxSalary"]
  });

type JobFormValues = z.infer<typeof jobFormSchema>;

type AddJobModalProps = {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
};

export default function AddJobModal({ isOpen, onClose, job }: AddJobModalProps) {
  const isEditMode = !!job;
  const { toast } = useToast();
  const { user } = useAuth();

  // Get recruiters for assignment dropdown
  const { data: users = [] } = useQuery<Array<any>>({
    queryKey: ["/api/users"],
    enabled: isOpen && user?.role === "hiring_manager",
  });

  // Filter to just show recruiters
  const recruiters = users.filter(user => user.role === "recruiter" && user.isActive);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title || "",
      department: job?.department || "",
      location: job?.location || "",
      description: job?.description || "",
      requirements: job?.requirements || "",
      minSalary: job?.minSalary || undefined,
      maxSalary: job?.maxSalary || undefined,
      employmentType: job?.employmentType || "Full-time",
      status: job?.status || "draft",
      recruiterId: job?.recruiterId || undefined,
    },
  });

  // Reset form when job changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: job?.title || "",
        department: job?.department || "",
        location: job?.location || "",
        description: job?.description || "",
        requirements: job?.requirements || "",
        minSalary: job?.minSalary || undefined,
        maxSalary: job?.maxSalary || undefined,
        employmentType: job?.employmentType || "Full-time",
        status: job?.status || "draft",
        recruiterId: job?.recruiterId || undefined,
      });
    }
  }, [isOpen, job, form]);

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      const res = await apiRequest("POST", "/api/jobs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Job has been created successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      if (!job) throw new Error("No job to update");
      
      const res = await apiRequest("PUT", `/api/jobs/${job.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Job has been updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormValues) => {
    if (isEditMode) {
      updateJobMutation.mutate(data);
    } else {
      createJobMutation.mutate(data);
    }
  };

  const handleSaveAsDraft = () => {
    const currentData = form.getValues();
    const dataWithDraftStatus = { ...currentData, status: "draft" };
    
    if (isEditMode) {
      updateJobMutation.mutate(dataWithDraftStatus);
    } else {
      createJobMutation.mutate(dataWithDraftStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Job Requirement" : "Create New Job Requirement"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Human Resources">Human Resources</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Customer Support">Customer Support</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Remote, New York, NY"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Salary</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Salary</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Employment Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Temporary">Temporary</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recruiterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Recruiter</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Recruiter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Select Recruiter</SelectItem>
                          {recruiters.map((recruiter) => (
                            <SelectItem key={recruiter.id} value={recruiter.id.toString()}>
                              {recruiter.firstName} {recruiter.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={
                  createJobMutation.isPending || 
                  updateJobMutation.isPending
                }
              >
                Save as Draft
              </Button>
              <Button 
                type="submit"
                disabled={
                  createJobMutation.isPending || 
                  updateJobMutation.isPending
                }
              >
                {(createJobMutation.isPending || updateJobMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Job" : "Create Job"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

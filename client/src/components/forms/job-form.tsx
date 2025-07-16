import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User } from "@shared/schema";

// Defining schema based on insertJobRequirementSchema
const jobFormSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  minSalary: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxSalary: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  employmentType: z.string().default("Full-time"),
  status: z.enum(["draft", "active", "on_hold", "filled", "closed"]).default("draft"),
  hiringManagerId: z.number().optional(),
  recruiterId: z.number().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  defaultValues?: Partial<JobFormValues>;
  onSubmit: (values: JobFormValues) => void;
  isSubmitting: boolean;
  recruiters?: User[];
  hiringManagerId?: number;
  mode: "create" | "edit";
}

export function JobForm({
  defaultValues = {
    title: "",
    department: "",
    location: "",
    description: "",
    requirements: "",
    minSalary: "",
    maxSalary: "",
    employmentType: "Full-time",
    status: "draft"
  },
  onSubmit,
  isSubmitting,
  recruiters = [],
  hiringManagerId,
  mode,
}: JobFormProps) {
  // Add hiringManagerId to defaultValues if provided
  React.useEffect(() => {
    if (hiringManagerId && mode === "create") {
      form.setValue("hiringManagerId", hiringManagerId);
    }
  }, [hiringManagerId]);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });

  const handleSubmit = (values: JobFormValues) => {
    onSubmit(values);
  };

  const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship"
  ];

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "filled", label: "Filled" },
    { value: "closed", label: "Closed" }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    <Input {...field} placeholder="e.g. Remote, New York, NY" />
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
                      <Input {...field} type="number" />
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
                      <Input {...field} type="number" />
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
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
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
                    onValueChange={(value) => field.onChange(value === "unassigned" ? undefined : parseInt(value))}
                    defaultValue={field.value?.toString() || "unassigned"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Recruiter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Select Recruiter</SelectItem>
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
                    <Textarea {...field} rows={5} />
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
                    <Textarea {...field} rows={5} />
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
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const values = form.getValues();
              onSubmit({ ...values, status: "draft" });
            }}
          >
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : mode === "create" ? "Create Job" : "Update Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

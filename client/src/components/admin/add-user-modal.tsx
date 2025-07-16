import { useEffect } from "react";
import { User, insertUserSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Extend the insert schema for validation
const userFormSchema = insertUserSchema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // Only validate confirmPassword if password is provided
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// If editing a user, create a separate schema
const editUserFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["admin", "hiring_manager", "recruiter"]),
  isActive: z.boolean(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // Only validate confirmPassword if password is provided
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Union type to handle both schemas
type UserFormValues = z.infer<typeof userFormSchema> | z.infer<typeof editUserFormSchema>;

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: Omit<User, "password"> | null;
};

export default function AddUserModal({ isOpen, onClose, user }: AddUserModalProps) {
  const isEditMode = !!user;
  const { toast } = useToast();

  // Use appropriate schema based on if we're editing or adding
  const schema = isEditMode ? editUserFormSchema : userFormSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      role: user?.role || "recruiter",
      isActive: user?.isActive ?? true,
      password: "",
      confirmPassword: "",
    },
  });

  // Reset form when user changes (when opening modal for different users)
  useEffect(() => {
    if (isOpen) {
      form.reset({
        username: user?.username || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        role: user?.role || "recruiter",
        isActive: user?.isActive ?? true,
        password: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, user, form]);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userToCreate } = data;
      const res = await apiRequest("POST", "/api/users", userToCreate);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "User has been created successfully",
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

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      if (!user) throw new Error("No user to update");
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userToUpdate } = data;
      
      // Only include password if it's provided
      if (!userToUpdate.password) {
        delete userToUpdate.password;
      }
      
      const res = await apiRequest("PUT", `/api/users/${user.id}`, userToUpdate);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "User has been updated successfully",
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

  const onSubmit = (data: UserFormValues) => {
    if (isEditMode) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Only show password fields on new user or when editing with intention to change password */}
            {(!isEditMode || form.watch("password")) && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isEditMode ? "New Password (optional)" : "Password"}
                      </FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Active
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={
                  createUserMutation.isPending || 
                  updateUserMutation.isPending
                }
              >
                {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update User" : "Add User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

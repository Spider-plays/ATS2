import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/user-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Search, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function UserManagement() {
  const { toast } = useToast();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { user: currentUser } = useAuth();
  
  // Fetch users
  const { data: users, isLoading } = useQuery<Array<Omit<User, "password">>>({
    queryKey: ["/api/users", currentUser?.role],
    refetchInterval: false,
    staleTime: Infinity,
  });

  // Show action buttons based on role
  const showActions = currentUser?.role === "admin";

  // Setup WebSocket listener for user updates
  React.useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'user_created' || data.type === 'user_deleted' || data.type === 'user_updated') {
        // Refresh the users list
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      }
    };

    return () => ws.close();
  }, []);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        variant: "success",
      });
      setShowAddUserDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: any }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated successfully",
        variant: "success",
      });
      setShowEditUserDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted successfully",
        variant: "success",
      });
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (userData: any) => {
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (userData: any) => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        userData: userData,
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Filter users based on role, status, and search query
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.active) ||
        (statusFilter === "inactive" && !user.active);
      const matchesSearch =
        searchQuery === "" ||
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const userColumns = [
    {
      key: "name",
      header: "Name",
      render: (user: User) => (
        <div className="flex items-center">
          <Avatar 
            initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`} 
            className="mr-4"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user: User) => (
        <div className="text-sm text-gray-500">{user.email}</div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => {
        const roleVariant = 
          user.role === "admin" ? "info" :
          user.role === "hiring_manager" ? "purple" : "warning";

        const roleName = user.role
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return (
          <Badge variant={roleVariant}>{roleName}</Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <Badge variant={user.active ? "success" : "danger"}>
          {user.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (user: User) => (
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEditUser(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteUser(user)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="User Management">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
          <Button 
            className="flex items-center" 
            onClick={() => setShowAddUserDialog(true)}
          >
            <Users className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Select 
              value={roleFilter} 
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users table */}
        <DataTable
          data={filteredUsers}
          columns={userColumns}
          keyExtractor={(user) => user.id}
          isLoading={isLoading}
          footer={
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">
                    {filteredUsers?.length || 0}
                  </span>{" "}
                  of <span className="font-medium">{users?.length || 0}</span>{" "}
                  results
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreateUser}
            isSubmitting={createUserMutation.isPending}
            submitLabel="Add User"
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              defaultValues={{
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                username: selectedUser.username,
                role: selectedUser.role,
                active: selectedUser.active,
              }}
              onSubmit={handleUpdateUser}
              isSubmitting={updateUserMutation.isPending}
              submitLabel="Update User"
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.firstName}{" "}
              {selectedUser?.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
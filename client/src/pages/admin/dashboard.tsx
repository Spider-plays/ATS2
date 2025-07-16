import React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/user-form";
import { Users, Briefcase, UserCheck, UserPlus, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [showAddUserDialog, setShowAddUserDialog] = React.useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch users for the table
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User added successfully",
        variant: "success",
      });
      setShowAddUserDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add user",
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
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddUser = (userData: any) => {
    addUserMutation.mutate(userData);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

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
          <Button variant="ghost" size="sm" onClick={() => console.log("Edit user", user.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteUser(user.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={statsLoading ? "..." : stats?.totalUsers || 0}
          icon={<Users />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
          trend={{
            value: 12,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Open Jobs"
          value={statsLoading ? "..." : stats?.openJobs || 0}
          icon={<Briefcase />}
          iconBgColor="bg-green-100"
          iconColor="text-green-500"
          trend={{
            value: 8,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Active Recruiters"
          value={statsLoading ? "..." : stats?.activeRecruiters || 0}
          icon={<UserCheck />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
          trend={{
            value: 5,
            isUpward: true,
            label: "from last month",
          }}
        />
        <StatCard
          title="Total Applicants"
          value={statsLoading ? "..." : stats?.totalApplicants || 0}
          icon={<UserPlus />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-500"
          trend={{
            value: 3,
            isUpward: false,
            label: "from last month",
          }}
        />
      </div>

      {/* User Management Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Users className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <UserForm
                onSubmit={handleAddUser}
                isSubmitting={addUserMutation.isPending}
                submitLabel="Add User"
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Users table */}
        <DataTable
          data={users || []}
          columns={userColumns}
          keyExtractor={(user) => user.id}
          isLoading={usersLoading}
          footer={
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">
                    {users?.length || 0}
                  </span>{" "}
                  of <span className="font-medium">{users?.length || 0}</span>{" "}
                  results
                </p>
              </div>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}

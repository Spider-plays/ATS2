
import React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Mail, Database, Users, Bell } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [autoAssignment, setAutoAssignment] = React.useState(false);
  const [requireApproval, setRequireApproval] = React.useState(true);

  const handleSaveGeneralSettings = () => {
    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully.",
    });
  };

  const handleSaveSecuritySettings = () => {
    toast({
      title: "Security settings saved",
      description: "Security settings have been updated successfully.",
    });
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Email settings saved",
      description: "Email notification settings have been updated successfully.",
    });
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure general system settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="ATS Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-website">Company Website</Label>
                <Input id="company-website" defaultValue="https://company.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-description">Company Description</Label>
              <Textarea 
                id="company-description" 
                defaultValue="A leading technology company focused on innovation and growth."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-timezone">Default Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Standard Time</SelectItem>
                    <SelectItem value="pst">Pacific Standard Time</SelectItem>
                    <SelectItem value="cst">Central Standard Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="mm-dd-yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSaveGeneralSettings}>Save General Settings</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require users to verify their email address before accessing the system
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable two-factor authentication for all users
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="1440" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (6+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, numbers)</SelectItem>
                    <SelectItem value="high">High (8+ chars, numbers, symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSaveSecuritySettings}>Save Security Settings</Button>
          </CardContent>
        </Card>

        {/* User Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Configure user registration and management settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-assign recruiters to jobs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign available recruiters to new job postings
                </p>
              </div>
              <Switch checked={autoAssignment} onCheckedChange={setAutoAssignment} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require approval for new users</Label>
                <p className="text-sm text-muted-foreground">
                  New user registrations require admin approval before activation
                </p>
              </div>
              <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="default-role">Default Role for New Users</Label>
              <Select defaultValue="recruiter">
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveGeneralSettings}>Save User Settings</Button>
          </CardContent>
        </Card>

        {/* Email & Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure email notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for system events
                </p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-server">SMTP Server</Label>
                <Input id="smtp-server" defaultValue="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" type="number" defaultValue="587" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input id="smtp-username" defaultValue="admin@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email Address</Label>
                <Input id="from-email" defaultValue="noreply@company.com" />
              </div>
            </div>
            <Button onClick={handleSaveEmailSettings}>Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              System Maintenance
            </CardTitle>
            <CardDescription>
              Database maintenance and system cleanup tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline">
                Export User Data
              </Button>
              <Button variant="outline">
                Export Job Data
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline">
                Clean up Old Sessions
              </Button>
              <Button variant="outline">
                Archive Closed Jobs
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Danger Zone</Label>
              <p className="text-sm text-muted-foreground">
                These actions cannot be undone. Please be careful.
              </p>
              <Button variant="destructive" size="sm">
                Reset All User Passwords
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

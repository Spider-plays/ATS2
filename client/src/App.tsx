import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/hooks/websocket-provider";
import AdminDashboard from "./pages/admin/dashboard";
import UserManagement from "./pages/admin/user-management";
import AdminAnalytics from "./pages/admin/analytics";
import AdminSettings from "./pages/admin/settings";
import HiringManagerDashboard from "./pages/hiring-manager/dashboard";
import HiringManagerRecruiters from "./pages/hiring-manager/recruiters";
import HiringManagerReports from "./pages/hiring-manager/reports";
import HiringManagerJobRequirements from "./pages/hiring-manager/job-requirements";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettings />
          </ProtectedRoute>
        } />

      {/* Hiring Manager Routes */}
      <Route path="/hiring-manager/dashboard" element={
          <ProtectedRoute allowedRoles={["hiring_manager"]}>
            <HiringManagerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/hiring-manager/job-requirements" element={
          <ProtectedRoute allowedRoles={["hiring_manager"]}>
            <HiringManagerJobRequirements />
          </ProtectedRoute>
        } />
        <Route path="/hiring-manager/recruiters" element={
          <ProtectedRoute allowedRoles={["hiring_manager"]}>
            <HiringManagerRecruiters />
          </ProtectedRoute>
        } />
        <Route path="/hiring-manager/reports" element={
          <ProtectedRoute allowedRoles={["hiring_manager"]}>
            <HiringManagerReports />
          </ProtectedRoute>
        } />
        
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
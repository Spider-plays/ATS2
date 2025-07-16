
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  path?: string;
  component?: () => React.JSX.Element;
  children?: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  path,
  component: Component,
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    const loadingComponent = (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );

    if (path) {
      return <Route path={path}>{loadingComponent}</Route>;
    }
    return loadingComponent;
  }

  if (!user) {
    const redirectComponent = <Redirect to="/auth" />;
    if (path) {
      return <Route path={path}>{redirectComponent}</Route>;
    }
    return redirectComponent;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const forbiddenComponent = (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
    
    if (path) {
      return <Route path={path}>{forbiddenComponent}</Route>;
    }
    return forbiddenComponent;
  }

  if (children) {
    return <>{children}</>;
  }

  if (Component && path) {
    return <Route path={path} component={Component} />;
  }

  return null;
}

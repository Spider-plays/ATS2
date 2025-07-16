import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Login/Register Forms Column */}
        <div className="w-full md:w-1/2 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ATS System</h1>
            <p className="text-gray-600 mt-2">
              Sign in to your account to get started
            </p>
          </div>
          
          <LoginForm />
        </div>

        {/* Hero Information Column */}
        <div className="hidden md:block md:w-1/2 bg-primary p-8 text-white">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">
              Applicant Tracking System
            </h2>
            <p className="mb-6 text-lg opacity-90">
              Streamline your recruiting process with our comprehensive applicant tracking system.
            </p>

            <Card className="bg-white/10 backdrop-blur-sm border-0 mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      ✓
                    </div>
                    <span>Role-based dashboards</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      ✓
                    </div>
                    <span>Job requirement management</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      ✓
                    </div>
                    <span>Applicant tracking</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      ✓
                    </div>
                    <span>Interview scheduling</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <p className="text-sm opacity-80">
              Designed for HR professionals, hiring managers, and recruiters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

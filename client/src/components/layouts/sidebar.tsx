import React from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Users,
  BarChart2,
  Settings,
  LogOut,
  LayoutDashboard,
  Briefcase,
  ListChecks,
  UserPlus,
  PieChart,
  ClipboardList,
  UserCheck,
  Layers,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const adminMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "User Management", href: "/admin/user-management" },
  { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const hiringManagerMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/hiring-manager/dashboard" },
  { icon: Briefcase, label: "Job Requirements", href: "/hiring-manager/job-requirements" },
  { icon: UserCheck, label: "Recruiters", href: "/hiring-manager/recruiters" },
  { icon: PieChart, label: "Reports", href: "/hiring-manager/reports" },
];

const recruiterMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/recruiter/dashboard" },
  { icon: ClipboardList, label: "My Requirements", href: "/recruiter/requirements" },
  { icon: UserPlus, label: "Applicants", href: "/recruiter/applicants" },
  { icon: Layers, label: "Pipeline", href: "/recruiter/pipeline" },
];

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = React.useMemo(() => {
    switch (user?.role) {
      case "admin":
        return adminMenuItems;
      case "hiring_manager":
        return hiringManagerMenuItems;
      case "recruiter":
        return recruiterMenuItems;
      default:
        return [];
    }
  }, [user?.role]);

  const userInitials = React.useMemo(() => {
    if (!user) return "";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }, [user]);

  const roleName = React.useMemo(() => {
    if (!user) return "";
    return user.role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [user]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-4">
        <button
          className="text-gray-800 hover:text-primary focus:outline-none focus:text-primary"
          onClick={toggleMobileSidebar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 shadow-lg flex-col bg-gray-800 text-white",
          mobileOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden md:flex"
        )}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-semibold">ATS System</h1>
          <button
            className="md:hidden text-white"
            onClick={toggleMobileSidebar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <Avatar initials={userInitials} />
            <div className="ml-3">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-400">{roleName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs text-gray-400 uppercase font-medium mb-2">
            {roleName}
          </p>
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md mb-1 transition",
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-2">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-300 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
import { User } from "@shared/schema";
import { DashboardSection } from "@/pages/dashboard-page";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard,
  Users,
  BarChart,
  Settings,
  Briefcase,
  UserCheck,
  PieChart,
  ClipboardList,
  UserPlus,
  ListTodo,
  LogOut
} from "lucide-react";

type SidebarProps = {
  user: Omit<User, "password">;
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
};

export default function Sidebar({
  user,
  activeSection,
  setActiveSection,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const { logoutMutation } = useAuth();

  const handleSectionClick = (section: DashboardSection) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Get user initials for avatar
  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  // Display name
  const displayName = `${user.firstName} ${user.lastName}`;

  // Role display name
  const roleDisplayMap: Record<string, string> = {
    "admin": "Admin",
    "hiring_manager": "Hiring Manager",
    "recruiter": "Recruiter"
  };

  return (
    <>
      <aside 
        className={`${isMobileMenuOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} md:flex md:w-64 shadow-lg flex-col bg-gray-800 text-white`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold">ATS System</h1>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
              {userInitials}
            </div>
            <div className="ml-3">
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-gray-400">{roleDisplayMap[user.role]}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {/* Admin Navigation */}
          {user.role === "admin" && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-2">Admin</p>
              <NavItem 
                icon={<LayoutDashboard className="w-5 h-5" />} 
                label="Dashboard" 
                isActive={activeSection === "dashboard"} 
                onClick={() => handleSectionClick("dashboard")} 
              />
              <NavItem 
                icon={<Users className="w-5 h-5" />} 
                label="User Management" 
                isActive={activeSection === "users"} 
                onClick={() => handleSectionClick("users")} 
              />
              <NavItem 
                icon={<BarChart className="w-5 h-5" />} 
                label="Analytics" 
                isActive={activeSection === "analytics"} 
                onClick={() => handleSectionClick("analytics")} 
              />
              <NavItem 
                icon={<Settings className="w-5 h-5" />} 
                label="Settings" 
                isActive={activeSection === "settings"} 
                onClick={() => handleSectionClick("settings")} 
              />
            </div>
          )}
          
          {/* Hiring Manager Navigation */}
          {user.role === "hiring_manager" && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-2">Hiring Manager</p>
              <NavItem 
                icon={<LayoutDashboard className="w-5 h-5" />} 
                label="Dashboard" 
                isActive={activeSection === "dashboard"} 
                onClick={() => handleSectionClick("dashboard")} 
              />
              <NavItem 
                icon={<Briefcase className="w-5 h-5" />} 
                label="Job Requirements" 
                isActive={activeSection === "jobs"} 
                onClick={() => handleSectionClick("jobs")} 
              />
              <NavItem 
                icon={<UserCheck className="w-5 h-5" />} 
                label="Recruiters" 
                isActive={activeSection === "recruiters"} 
                onClick={() => handleSectionClick("recruiters")} 
              />
              <NavItem 
                icon={<PieChart className="w-5 h-5" />} 
                label="Reports" 
                isActive={activeSection === "reports"} 
                onClick={() => handleSectionClick("reports")} 
              />
            </div>
          )}
          
          {/* Recruiter Navigation */}
          {user.role === "recruiter" && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-2">Recruiter</p>
              <NavItem 
                icon={<LayoutDashboard className="w-5 h-5" />} 
                label="Dashboard" 
                isActive={activeSection === "dashboard"} 
                onClick={() => handleSectionClick("dashboard")} 
              />
              <NavItem 
                icon={<ClipboardList className="w-5 h-5" />} 
                label="My Requirements" 
                isActive={activeSection === "requirements"} 
                onClick={() => handleSectionClick("requirements")} 
              />
              <NavItem 
                icon={<UserPlus className="w-5 h-5" />} 
                label="Applicants" 
                isActive={activeSection === "applicants"} 
                onClick={() => handleSectionClick("applicants")} 
              />
              <NavItem 
                icon={<ListTodo className="w-5 h-5" />} 
                label="Pipeline" 
                isActive={activeSection === "pipeline"} 
                onClick={() => handleSectionClick("pipeline")} 
              />
            </div>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center text-gray-300 hover:text-white transition w-full"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-md mb-1 w-full ${
        isActive 
          ? "bg-gray-700 text-white" 
          : "text-gray-300 hover:bg-gray-700 hover:text-white transition"
      }`}
    >
      <span className="w-5">{icon}</span>
      <span className="ml-2">{label}</span>
    </button>
  );
}

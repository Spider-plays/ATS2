import { useState, useRef, useEffect } from "react";
import { User } from "@shared/schema";
import { Bell, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type HeaderProps = {
  title: string;
  user: Omit<User, "password">;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
};

export default function Header({ title, user, setIsMobileMenuOpen }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { logoutMutation } = useAuth();

  // Get user initials for avatar
  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden text-gray-800 mr-4"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Bell className="w-6 h-6" />
            </button>
            
            <div className="relative" ref={userMenuRef}>
              <button 
                className="flex items-center focus:outline-none"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                  {userInitials}
                </div>
                <ChevronDown className="ml-1 w-4 h-4 text-gray-500" />
              </button>
              
              {/* User menu dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <button 
                    onClick={() => logoutMutation.mutateAsync()}
                    disabled={logoutMutation.isPending}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

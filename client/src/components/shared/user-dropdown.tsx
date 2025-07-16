import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { ChevronDownIcon } from "lucide-react";

interface UserDropdownProps {
  initials: string;
}

export function UserDropdown({ initials }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logoutMutation } = useAuth();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center focus:outline-none"
        onClick={toggleDropdown}
      >
        <Avatar initials={initials} size="sm" />
        <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <Link href="/profile">
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Your Profile
            </a>
          </Link>
          <Link href="/settings">
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Settings
            </a>
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import LiveDashboard from "@/components/shared/live-dashboard";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isLiveActivityOpen, setIsLiveActivityOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-auto px-2 sm:px-4 lg:px-6">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>

        {/* Live Activity Panel - Collapsible */}
        <aside className={`
          ${isLiveActivityOpen ? 'w-72' : 'w-0'} 
          transition-all duration-300 ease-in-out
          bg-white border-l border-gray-200 overflow-hidden
          absolute right-0 top-0 h-full z-10
          lg:relative lg:w-72 lg:block
        `}>
          <div className="h-full">
            <LiveDashboard />
          </div>
        </aside>

        {/* Toggle Button for Mobile/Tablet */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLiveActivityOpen(!isLiveActivityOpen)}
          className={`
            fixed right-4 top-4 z-20 lg:hidden
            ${isLiveActivityOpen ? 'right-76' : 'right-4'}
            transition-all duration-300
          `}
        >
          {isLiveActivityOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <Activity className="h-4 w-4" />
          )}
        </Button>

        {/* Overlay for mobile when live activity is open */}
        {isLiveActivityOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-5"
            onClick={() => setIsLiveActivityOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
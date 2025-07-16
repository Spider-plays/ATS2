import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isUpward: boolean;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-500",
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-6", className)}>
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            iconBgColor
          )}
        >
          <div className={cn("h-6 w-6", iconColor)}>{icon}</div>
        </div>
      </div>
      {trend && (
        <div className="mt-3">
          <span
            className={cn(
              "text-sm font-medium flex items-center",
              trend.isUpward ? "text-green-500" : "text-red-500"
            )}
          >
            {trend.isUpward ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {trend.value}%
          </span>
          <span className="text-gray-400 text-sm ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

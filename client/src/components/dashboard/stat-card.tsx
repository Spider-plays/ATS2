type StatCardProps = {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "green" | "purple" | "amber" | "red";
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
};

export default function StatCard({ title, value, icon, color, change }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-500",
    green: "bg-green-100 text-green-500",
    purple: "bg-purple-100 text-purple-500",
    amber: "bg-amber-100 text-amber-500",
    red: "bg-red-100 text-red-500",
  };

  const iconMap: Record<string, string> = {
    "users": "fas fa-users",
    "briefcase": "fas fa-briefcase",
    "user-tie": "fas fa-user-tie",
    "user-plus": "fas fa-user-plus",
    "calendar-check": "fas fa-calendar-check",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${colorMap[color]} flex items-center justify-center`}>
          <i className={iconMap[icon]}></i>
        </div>
      </div>
      {change && (
        <div className="mt-3">
          <span className={change.type === "increase" ? "text-green-500 text-sm font-medium" : "text-red-500 text-sm font-medium"}>
            <i className={change.type === "increase" ? "fas fa-arrow-up" : "fas fa-arrow-down"}></i> {change.value}%
          </span>
          <span className="text-gray-400 text-sm ml-1">from last month</span>
        </div>
      )}
    </div>
  );
}

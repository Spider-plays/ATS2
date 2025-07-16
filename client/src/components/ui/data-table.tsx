import React from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  footer?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  keyExtractor,
  isLoading = false,
  footer,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  scope="col"
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  "hover:bg-gray-50",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => {
                  const key = column.key.toString();
                  return (
                    <td
                      key={key}
                      className={cn("px-6 py-4 whitespace-nowrap", column.className)}
                    >
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="px-6 py-3 bg-white border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}

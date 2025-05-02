
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart, Clock, AlertTriangle, Search, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusCardProps = {
  title: string;
  value: string | number;
  icon: string;
  status?: "success" | "error" | "warning" | "info";
};

export const StatusCard = ({ title, value, icon, status = "info" }: StatusCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case "activity":
        return <Activity className="h-4 w-4" />;
      case "bar-chart":
        return <BarChart className="h-4 w-4" />;
      case "clock":
        return <Clock className="h-4 w-4" />;
      case "alert-triangle":
        return <AlertTriangle className="h-4 w-4" />;
      case "search":
        return <Search className="h-4 w-4" />;
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-500";
      case "error":
        return "bg-red-500/20 text-red-500";
      case "warning":
        return "bg-amber-500/20 text-amber-500";
      case "info":
      default:
        return "bg-blue-500/20 text-blue-500";
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn("p-2 rounded-full", getStatusColor())}>
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

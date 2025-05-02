
import React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="bg-primary text-primary-foreground p-1 rounded">
        <Eye size={18} />
      </div>
      <span className="font-bold text-lg">TrafficEye</span>
    </div>
  );
};

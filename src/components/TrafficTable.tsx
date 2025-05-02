
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type TrafficLogType = {
  timestamp: string;
  port: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  target: string;
};

type TrafficTableProps = {
  trafficLogs: TrafficLogType[];
  onSelect: (log: TrafficLogType) => void;
};

export const TrafficTable = ({ trafficLogs, onSelect }: TrafficTableProps) => {
  const getStatusColor = (status?: number) => {
    if (!status) return "bg-gray-300";
    if (status < 300) return "bg-green-500";
    if (status < 400) return "bg-blue-500";
    if (status < 500) return "bg-amber-500";
    return "bg-red-500";
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "POST":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "PUT":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "DELETE":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };
  
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead className="w-[80px]">Port</TableHead>
            <TableHead className="w-[80px]">Method</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="w-[100px]">Target</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[100px] text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trafficLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No traffic logs available
              </TableCell>
            </TableRow>
          ) : (
            trafficLogs.slice(0, 100).map((log, i) => (
              <TableRow 
                key={i} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect(log)}
              >
                <TableCell className="text-xs">
                  {formatTime(log.timestamp)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.port}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn("font-mono", getMethodColor(log.method))}>
                    {log.method}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate font-mono text-xs">
                  {log.url}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground truncate">
                  {new URL(log.target).hostname}
                </TableCell>
                <TableCell>
                  {log.status ? (
                    <div className="flex items-center">
                      <div 
                        className={cn("w-2 h-2 rounded-full mr-2", getStatusColor(log.status))} 
                      />
                      {log.status}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {log.duration ? (
                    <span 
                      className={cn(
                        "font-mono",
                        log.duration > 1000 ? "text-amber-500" : "text-muted-foreground"
                      )}
                    >
                      {log.duration} ms
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

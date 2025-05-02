
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type TrafficSummaryProps = {
  trafficLogs: any[];
};

export const TrafficSummary = ({ trafficLogs }: TrafficSummaryProps) => {
  const summary = useMemo(() => {
    const methodStats: Record<string, number> = {};
    const statusCodeStats: Record<string, number> = {};
    const endpointStats: Record<string, number> = {};
    const portStats: Record<string, { count: number; target: string }> = {};
    
    let totalResponseTime = 0;
    let completedRequests = 0;
    let slowestRequest = { url: "", duration: 0 };
    let fastestRequest = { url: "", duration: Number.MAX_SAFE_INTEGER };
    
    trafficLogs.forEach((log) => {
      // Method stats
      if (log.method) {
        methodStats[log.method] = (methodStats[log.method] || 0) + 1;
      }
      
      // Status code stats
      if (log.status) {
        const statusGroup = `${Math.floor(log.status / 100)}xx`;
        statusCodeStats[statusGroup] = (statusCodeStats[statusGroup] || 0) + 1;
        statusCodeStats[log.status] = (statusCodeStats[log.status] || 0) + 1;
      }
      
      // Endpoint stats
      if (log.url) {
        // Extract pathname
        try {
          const pathname = new URL(log.url.startsWith("http") ? log.url : `http://example.com${log.url}`).pathname;
          endpointStats[pathname] = (endpointStats[pathname] || 0) + 1;
        } catch (e) {
          endpointStats[log.url] = (endpointStats[log.url] || 0) + 1;
        }
      }
      
      // Port stats
      if (log.port) {
        portStats[log.port] = portStats[log.port] || { count: 0, target: log.target };
        portStats[log.port].count += 1;
      }
      
      // Response time stats
      if (log.duration) {
        totalResponseTime += log.duration;
        completedRequests++;
        
        if (log.duration > slowestRequest.duration) {
          slowestRequest = { url: log.url, duration: log.duration };
        }
        
        if (log.duration < fastestRequest.duration) {
          fastestRequest = { url: log.url, duration: log.duration };
        }
      }
    });
    
    const avgResponseTime = completedRequests > 0 ? totalResponseTime / completedRequests : 0;
    
    // Sort by count descending
    const sortedMethods = Object.entries(methodStats).sort((a, b) => b[1] - a[1]);
    const sortedStatusCodes = Object.entries(statusCodeStats).sort((a, b) => b[1] - a[1]);
    const sortedEndpoints = Object.entries(endpointStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 endpoints
    
    return {
      methods: sortedMethods,
      statusCodes: sortedStatusCodes,
      endpoints: sortedEndpoints,
      ports: Object.entries(portStats),
      avgResponseTime,
      slowestRequest: slowestRequest.duration > 0 ? slowestRequest : null,
      fastestRequest: fastestRequest.duration < Number.MAX_SAFE_INTEGER ? fastestRequest : null,
      totalRequests: trafficLogs.length,
      completedRequests,
    };
  }, [trafficLogs]);
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">By Method</h3>
              <div className="flex flex-wrap gap-2">
                {summary.methods.map(([method, count], i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {method}: {count}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">By Status Code</h3>
              <div className="flex flex-wrap gap-2">
                {summary.statusCodes.map(([status, count], i) => {
                  const getStatusColor = (status: string) => {
                    if (status.startsWith("2")) return "bg-green-500 text-white";
                    if (status.startsWith("3")) return "bg-blue-500 text-white";
                    if (status.startsWith("4")) return "bg-amber-500 text-white";
                    if (status.startsWith("5")) return "bg-red-500 text-white";
                    return "";
                  };
                  
                  return (
                    <Badge 
                      key={i} 
                      className={getStatusColor(status)}
                    >
                      {status}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">By Port</h3>
              <div className="grid grid-cols-2 gap-2">
                {summary.ports.map(([port, { count, target }], i) => (
                  <div key={i} className="flex flex-col p-2 border rounded-md">
                    <div className="flex justify-between mb-1">
                      <Badge variant="outline">{port}</Badge>
                      <Badge>{count}</Badge>
                    </div>
                    <span className="text-xs truncate text-muted-foreground">{target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.endpoints.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No endpoint data available</p>
            ) : (
              summary.endpoints.map(([endpoint, count], i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="font-mono text-xs truncate max-w-[250px]">{endpoint}</div>
                  <Badge>{count}</Badge>
                </div>
              ))
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Performance</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 border rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Avg Response</div>
                  <div className="font-bold">{summary.avgResponseTime.toFixed(2)} ms</div>
                </div>
                <div className="p-2 border rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Completed</div>
                  <div className="font-bold">
                    {summary.completedRequests}/{summary.totalRequests}
                  </div>
                </div>
              </div>
            </div>
            
            {summary.slowestRequest && (
              <div>
                <h3 className="text-sm font-medium mb-2">Slowest Request</h3>
                <div className="p-2 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="font-mono text-xs truncate max-w-[250px]">
                      {summary.slowestRequest.url}
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {summary.slowestRequest.duration} ms
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {summary.fastestRequest && (
              <div>
                <h3 className="text-sm font-medium mb-2">Fastest Request</h3>
                <div className="p-2 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="font-mono text-xs truncate max-w-[250px]">
                      {summary.fastestRequest.url}
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {summary.fastestRequest.duration} ms
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

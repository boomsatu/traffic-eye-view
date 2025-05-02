
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { io } from "socket.io-client";
import { Layout } from "@/components/Layout";
import { TrafficTable } from "@/components/TrafficTable";
import { TrafficChart } from "@/components/TrafficChart";
import { StatusCard } from "@/components/StatusCard";
import { RequestDetails } from "@/components/RequestDetails";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrafficSummary } from "@/components/TrafficSummary";
import { useTheme } from "@/components/ThemeProvider";

const Index = () => {
  const [trafficLogs, setTrafficLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeEndpoints, setActiveEndpoints] = useState({});
  const [requestsPerSecond, setRequestsPerSecond] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [responseTimeAvg, setResponseTimeAvg] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const { toast } = useToast();
  const { theme } = useTheme();
  
  useEffect(() => {
    // Connect to the socket server
    const socket = io("http://localhost:3000");
    
    // Initial data load
    socket.on("init", (data) => {
      setTrafficLogs(data);
      updateMetrics(data);
    });
    
    // Real-time traffic updates
    socket.on("traffic", (log) => {
      setTrafficLogs((prevLogs) => {
        const newLogs = [log, ...prevLogs].slice(0, 1000); // Keep last 1000 entries
        updateMetrics(newLogs);
        return newLogs;
      });
      
      // Update active endpoints
      setActiveEndpoints((prev) => {
        const key = `${log.port}:${log.target}`;
        return {
          ...prev,
          [key]: {
            count: (prev[key]?.count || 0) + 1,
            lastSeen: new Date(),
          },
        };
      });
      
      // Show toast for errors or specific conditions
      if (log.status >= 400) {
        toast({
          title: `Error ${log.status} on ${log.target}`,
          description: `${log.method} ${log.url}`,
          variant: "destructive",
        });
      }
    });
    
    // Updated traffic details
    socket.on("traffic-update", (log) => {
      setTrafficLogs((prevLogs) => {
        const updated = prevLogs.map((item) => {
          if (item.timestamp === log.timestamp && item.url === log.url) {
            return { ...item, status: log.status, duration: log.duration };
          }
          return item;
        });
        updateMetrics(updated);
        return updated;
      });
    });
    
    // Detailed traffic information
    socket.on("traffic-detail", (details) => {
      if (selectedLog && details.timestamp === selectedLog.timestamp) {
        setSelectedLog((prev) => ({ ...prev, details }));
      }
    });
    
    // Clean up
    return () => {
      socket.disconnect();
    };
  }, [selectedLog]);
  
  // Calculate metrics based on traffic logs
  const updateMetrics = (logs) => {
    // Calculate total requests
    setTotalRequests(logs.length);
    
    // Recent requests for RPS calculation (last 10 seconds)
    const now = Date.now();
    const recentLogs = logs.filter((log) => {
      return new Date(log.timestamp).getTime() > now - 10000;
    });
    setRequestsPerSecond(recentLogs.length / 10);
    
    // Average response time
    const completedRequests = logs.filter((log) => log.duration);
    if (completedRequests.length > 0) {
      const avgTime = completedRequests.reduce((sum, log) => sum + log.duration, 0) / completedRequests.length;
      setResponseTimeAvg(avgTime);
    }
    
    // Error rate
    const errorRequests = logs.filter((log) => log.status >= 400);
    setErrorRate(logs.length > 0 ? (errorRequests.length / logs.length) * 100 : 0);
  };
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Eye View</h1>
          <p className="text-muted-foreground">
            Monitor your proxy traffic in real-time across multiple endpoints
          </p>
        </div>
        <ThemeToggle />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          title="Total Requests" 
          value={totalRequests} 
          icon="activity" 
        />
        <StatusCard 
          title="Requests/Sec" 
          value={requestsPerSecond.toFixed(2)} 
          icon="bar-chart" 
        />
        <StatusCard 
          title="Avg Response Time" 
          value={`${responseTimeAvg.toFixed(0)} ms`} 
          icon="clock" 
        />
        <StatusCard 
          title="Error Rate" 
          value={`${errorRate.toFixed(2)}%`} 
          icon="alert-triangle" 
          status={errorRate > 5 ? "error" : "success"}
        />
      </div>
      
      <div className="grid gap-4 mt-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle>Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart trafficLogs={trafficLogs} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Active Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(activeEndpoints).map(([key, data], i) => {
                const [port, target] = key.split(":");
                const timeSince = Math.round((new Date() - new Date(data.lastSeen)) / 1000);
                
                return (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <Badge variant="outline" className="mr-2">
                        {port}
                      </Badge>
                      <span className="text-sm truncate">{target}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge className="mr-2">{data.count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {timeSince}s ago
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4">
        <Tabs defaultValue="table">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="summary">Traffic Summary</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="table" className="mt-2">
            <TrafficTable 
              trafficLogs={trafficLogs} 
              onSelect={(log) => setSelectedLog(log)} 
            />
          </TabsContent>
          <TabsContent value="summary" className="mt-2">
            <TrafficSummary trafficLogs={trafficLogs} />
          </TabsContent>
        </Tabs>
      </div>
      
      {selectedLog && (
        <RequestDetails 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)}
        />
      )}
    </Layout>
  );
};

export default Index;

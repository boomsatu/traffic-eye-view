
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

type TrafficLogType = {
  timestamp: string;
  port: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  target: string;
};

type TrafficChartProps = {
  trafficLogs: TrafficLogType[];
};

export const TrafficChart = ({ trafficLogs }: TrafficChartProps) => {
  // Process data for the chart
  const processChartData = () => {
    if (!trafficLogs?.length) return [];
    
    // Group by minute for the last hour
    const now = new Date();
    const oneHourAgo = new Date(now);
    oneHourAgo.setHours(now.getHours() - 1);
    
    // Create time buckets (every minute for the last hour)
    const timeBuckets: Record<string, any> = {};
    for (let i = 0; i < 60; i++) {
      const bucketTime = new Date(oneHourAgo);
      bucketTime.setMinutes(oneHourAgo.getMinutes() + i);
      const bucketKey = format(bucketTime, "HH:mm");
      timeBuckets[bucketKey] = {
        time: bucketKey,
        requests: 0,
        errors: 0,
        avgResponseTime: 0,
        completedRequests: 0,
        totalResponseTime: 0,
      };
    }
    
    // Fill the buckets with data
    trafficLogs.forEach((log) => {
      try {
        const logTime = new Date(log.timestamp);
        if (logTime >= oneHourAgo && logTime <= now) {
          const bucketKey = format(logTime, "HH:mm");
          
          // Ensure bucket exists
          if (!timeBuckets[bucketKey]) {
            timeBuckets[bucketKey] = {
              time: bucketKey,
              requests: 0,
              errors: 0,
              avgResponseTime: 0,
              completedRequests: 0,
              totalResponseTime: 0,
            };
          }
          
          // Increment counters
          timeBuckets[bucketKey].requests += 1;
          
          if (log.status && log.status >= 400) {
            timeBuckets[bucketKey].errors += 1;
          }
          
          if (log.duration) {
            timeBuckets[bucketKey].completedRequests += 1;
            timeBuckets[bucketKey].totalResponseTime += log.duration;
            timeBuckets[bucketKey].avgResponseTime = 
              timeBuckets[bucketKey].totalResponseTime / timeBuckets[bucketKey].completedRequests;
          }
        }
      } catch (e) {
        console.error("Error processing log for chart:", e);
      }
    });
    
    // Convert to array and sort by time
    return Object.values(timeBuckets).sort((a: any, b: any) => {
      return a.time.localeCompare(b.time);
    });
  };
  
  const chartData = processChartData();
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
          <XAxis 
            dataKey="time" 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} ms`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            labelStyle={{
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="requests"
            name="Requests"
            stroke="#2563eb"
            activeDot={{ r: 8 }}
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="errors"
            name="Errors"
            stroke="#ef4444"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgResponseTime"
            name="Avg Response Time"
            stroke="#f59e0b"
            dot={false}
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

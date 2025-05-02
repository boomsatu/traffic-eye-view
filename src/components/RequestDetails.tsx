
import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

type RequestDetailsProps = {
  log: any;
  onClose: () => void;
};

export const RequestDetails = ({ log, onClose }: RequestDetailsProps) => {
  if (!log) return null;
  
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss.SSS");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const formatHeaders = (headers: any) => {
    if (!headers) return null;
    
    return (
      <div className="space-y-2">
        {Object.entries(headers).map(([key, value], i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <div className="font-mono text-xs text-muted-foreground">{key}:</div>
            <div className="col-span-2 font-mono text-xs break-all">{String(value)}</div>
          </div>
        ))}
      </div>
    );
  };
  
  const formatBody = (body: any) => {
    if (!body) return <div className="text-muted-foreground">No body data available</div>;
    
    try {
      // Try to parse as JSON
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      return (
        <pre className="bg-muted p-2 rounded-md overflow-auto text-xs font-mono">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (e) {
      // Return as text if not JSON
      return (
        <div className="bg-muted p-2 rounded-md overflow-auto text-xs font-mono whitespace-pre-wrap">
          {String(body)}
        </div>
      );
    }
  };
  
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Request Details</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-muted"
            >
              <X size={16} />
            </button>
          </div>
          <DialogDescription>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Badge>{log.method}</Badge>
                <span className="text-xs font-mono">{log.url}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{formatTimestamp(log.timestamp)}</span>
                <span>•</span>
                <span>Port: {log.port}</span>
                <span>•</span>
                <span>Target: {log.target}</span>
                {log.status && (
                  <>
                    <span>•</span>
                    <span>Status: {log.status}</span>
                  </>
                )}
                {log.duration && (
                  <>
                    <span>•</span>
                    <span>Duration: {log.duration} ms</span>
                  </>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="request">
          <TabsList className="w-full">
            <TabsTrigger value="request" className="flex-1">Request</TabsTrigger>
            <TabsTrigger value="response" className="flex-1">Response</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-2">
            <TabsContent value="request" className="p-2 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Request Headers</h3>
                {formatHeaders(log.headers)}
              </div>
              
              {log.details?.type === "REQUEST" && (
                <>
                  {log.details.body && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Request Body</h3>
                      {formatBody(log.details.body)}
                    </div>
                  )}
                  
                  {log.details.query && Object.keys(log.details.query).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Query Parameters</h3>
                      {formatBody(log.details.query)}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="response" className="p-2 space-y-4">
              {log.details?.type === "RESPONSE" ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Response Headers</h3>
                    {formatHeaders(log.details.headers)}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Response Body</h3>
                    {formatBody(log.details.body)}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No response data available yet
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="p-2 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Connection Details</h3>
                <div className="space-y-2">
                  {log.details?.ip && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-mono text-xs text-muted-foreground">IP:</div>
                      <div className="col-span-2 font-mono text-xs">{log.details.ip}</div>
                    </div>
                  )}
                  
                  {log.details?.protocol && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-mono text-xs text-muted-foreground">Protocol:</div>
                      <div className="col-span-2 font-mono text-xs">{log.details.protocol}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Raw Log Data</h3>
                <pre className="bg-muted p-2 rounded-md overflow-auto text-xs font-mono">
                  {JSON.stringify(log, null, 2)}
                </pre>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

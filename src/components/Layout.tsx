
import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Logo } from "./Logo";
import { SidebarNav } from "./SidebarNav";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="traffic-eye-theme">
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar defaultCollapsed={false}>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Traffic Eye View v1.0.0
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </div>
      </div>
    </ThemeProvider>
  );
};

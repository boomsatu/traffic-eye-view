
import React from "react";
import { Activity, Database, FileText, Monitor, Settings } from "lucide-react";
import { 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    icon: Activity,
    url: "/",
    active: true
  },
  {
    title: "Endpoints",
    icon: Database,
    url: "#",
    active: false
  },
  {
    title: "Logs",
    icon: FileText,
    url: "#",
    active: false
  },
  {
    title: "Live Monitor",
    icon: Monitor,
    url: "#",
    active: false
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
    active: false
  }
];

export const SidebarNav = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild active={item.active}>
                <a href={item.url} className="flex items-center">
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const projects = [
  {
    name: "Project 1",
  },
  {
    name: "Project 2",
  },
  {
    name: "Project 3",
  },
];

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathName = usePathname();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>Logo</SidebarHeader>
      <SidebarContent>
        <SidebarContent>
          {/* this group is for navigating through apges */}
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = pathName === item.url; // Check if the current path matches
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center space-x-2 rounded-md px-4 py-2 transition-colors",
                            isActive
                              ? "bg-black text-white" // Styles for the active path
                              : "text-gray-700 hover:bg-gray-200", // Styles for inactive paths
                          )}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {/* this group is for navigating through priojects */}
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => {
                  return (
                    <SidebarMenuItem key={project.name}>
                      <SidebarMenuButton asChild>
                        <div>
                          <div
                            className={cn(
                              "flex size-6 items-center justify-center rounded-sm border bg-white text-sm text-primary",
                              {
                                "bg-primary text-white": true,
                                "hover:bg-gray-20 text-gray-700": false,
                              },
                            )}
                          >
                            {project.name[0]}
                          </div>
                          <span>{project.name}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <div className="h-2"></div>
                <SidebarMenuItem>
                  <Link href="/create">
                    <Button size={'sm'} variant={"outline"} className="w-fit">
                      <Plus size={16} />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarContent>
    </Sidebar>
  );
}

"use client"

import * as React from "react"
import { ArrowUpRight, Command, LayoutDashboard, Palette, Settings, Users } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAdminProfileStore } from "@/stores/admin-profile-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create",
    url: "/dashboard/create",
    icon: Palette,
  },
  {
    title: "Links",
    url: "/dashboard/links",
    icon: ArrowUpRight,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profileState } = useAdminProfileStore()
  const accountName = profileState?.account.profileName || "Admin Profile"
  const accountEmail = profileState?.account.email || "admin@example.com"
  const roleLabel = profileState?.account.roleLabel || "Admin"

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{accountName}</span>
                  <span className="truncate text-xs">{roleLabel}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: accountName,
            email: accountEmail,
            role: roleLabel,
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

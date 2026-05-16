"use client"

import * as React from "react"
import { LayoutDashboard, Receipt, Settings, ShieldCheck, Users } from "lucide-react"

import { getProfileDisplayModel } from "@/features/profile/api"
import { useAdminProfileQuery } from "@/features/profile/query"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Subscriptions",
    url: "/dashboard/subscriptions",
    icon: Receipt,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: profileData } = useAdminProfileQuery()
  const profileDisplay = profileData ? getProfileDisplayModel(profileData) : null
  const accountName = profileDisplay?.name || "Admin Profile"
  const accountEmail = profileDisplay?.email || "admin@example.com"
  const roleLabel = profileDisplay?.roleLabel || "Admin"

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/80 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-[linear-gradient(135deg,#0f766e_0%,#10b981_100%)] text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-2xl shadow-sm">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-900">{accountName}</span>
                  <span className="truncate text-xs text-slate-500">{roleLabel}</span>
                </div>
                <div className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-emerald-700 uppercase xl:inline-flex">
                  Panel
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/80 p-3">
        <NavUser
          user={{
            name: accountName,
            email: accountEmail,
            roleLabel,
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

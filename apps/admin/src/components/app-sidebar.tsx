"use client"

import * as React from "react"
import { Images, LayoutDashboard, Receipt, Settings, ShieldCheck, Users } from "lucide-react"

import { getProfileDisplayModel } from "@/features/profile/api"
import { useAdminProfileQuery } from "@/features/profile/query"
import { useAppSettingsQuery } from "@/features/settings/query"
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
    title: "Photos",
    url: "/dashboard/photos",
    icon: Images,
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
  const { data: settings } = useAppSettingsQuery()
  const profileDisplay = profileData ? getProfileDisplayModel(profileData) : null
  const accountName = profileDisplay?.name || "Admin Profile"
  const accountEmail = profileDisplay?.email || "admin@example.com"
  const roleLabel = profileDisplay?.roleLabel || "Admin"
  // Brand label comes from app settings (admin-editable). Fall back to a
  // neutral default until the GET resolves.
  const appName = settings?.appName ?? "Dating Admin"

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/80 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-[linear-gradient(135deg,#0f766e_0%,#10b981_100%)] text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-2xl shadow-sm">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-900">{appName}</span>
                  <span className="truncate text-xs text-slate-500">Admin panel</span>
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

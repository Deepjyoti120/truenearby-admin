"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import type { BreadcrumbItemType } from "@/types"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppShell } from "./AppShell"
import { AppContent } from "./AppContent"

export function AppSidebarLayout({
  breadcrumbs = [],
  children,
}: {
  breadcrumbs?: BreadcrumbItemType[]
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppShell>
        <AppSidebar />

        <SidebarInset>
          <AppContent>
            <AppSidebarHeader breadcrumbs={breadcrumbs} />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </main>
          </AppContent>
        </SidebarInset>
      </AppShell>
    </SidebarProvider>
  )
}

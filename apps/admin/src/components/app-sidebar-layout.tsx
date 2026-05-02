"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Bell, ChevronRight, Search } from "lucide-react";
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button";

export type BreadcrumbItemType = {
  title: string;
  href?: string;
};

export function AppSidebarLayout({
  breadcrumbs,
  children,
}: {
  breadcrumbs?: BreadcrumbItemType[];
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="admin-shell">
        {/* Header */}
        <header className="sticky top-0 z-20 px-4 pt-4 md:px-6">
          <div className="admin-panel flex min-h-18 items-center justify-between gap-4 px-4 py-3 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="-ml-1 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50" />
              <Separator orientation="vertical" className="hidden h-5 md:block" />

              <div className="min-w-0 space-y-1">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((item, index) => {
                        const isLast = index === breadcrumbs.length - 1;

                        return [
                          <BreadcrumbItem key={`item-${index}`}>
                            {item.href && !isLast ? (
                              <BreadcrumbLink asChild>
                                <Link href={item.href}>{item.title}</Link>
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>,
                          !isLast ? (
                            <BreadcrumbSeparator key={`separator-${index}`}>
                              <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                          ) : null,
                        ];
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
                <p className="truncate text-sm text-slate-500">
                  Manage content, links, and account settings from a cleaner admin workspace.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex h-11 w-72 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-slate-500">
                <Search className="size-4" />
                <span className="text-sm">Search navigation, pages, or settings</span>
              </div>
              <Button variant="outline" size="icon" className="rounded-2xl bg-white">
                <Bell className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex flex-1 flex-col gap-6 px-4 py-4 md:px-6">{children}</main>

        {/* Global toaster */}
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}

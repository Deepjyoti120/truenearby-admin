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
import { ChevronRight } from "lucide-react";
import { Toaster } from "@/components/ui/sonner"

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

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />

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
        </header>

        {/* Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>

        {/* Global toaster */}
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}

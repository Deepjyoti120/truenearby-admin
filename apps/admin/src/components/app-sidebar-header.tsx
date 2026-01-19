"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export type BreadcrumbItemType = {
  title: string
  href?: string
}

export function AppSidebarHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[]
}) {
  return (
    <header
      className="
        flex h-16 shrink-0 items-center gap-2
        border-b border-sidebar-border/70
        px-6 transition-[width,height] ease-linear
        group-has-data-[collapsible=icon]/sidebar-wrapper:h-12
        md:px-4
      "
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />

        {breadcrumbs.length > 0 && (
          <>
            <Separator
              orientation="vertical"
              className="mx-2 h-4"
            />

            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <BreadcrumbItem key={index}>
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>
                        {item.title}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    )}

                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </>
        )}
      </div>
    </header>
  )
}

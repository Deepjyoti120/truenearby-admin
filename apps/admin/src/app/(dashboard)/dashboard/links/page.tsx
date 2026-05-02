import { ArrowUpRight, ExternalLink } from "lucide-react"

import { AppSidebarLayout } from "@/components/app-sidebar-layout"
import { CreativeAttributionNotice } from "@/components/creative-attribution-notice"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  creativeResourceCount,
  creativeResourceGroups,
} from "@/lib/creative-resources"

export default function LinksPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Links" },
  ]

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="admin-kicker">External resources</span>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Open any creative resource in a cleaner admin layout.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                This page keeps your Flaticon, author, sticker, and wallpaper
                links in one place with clear hierarchy and less visual clutter.
              </p>
              <CreativeAttributionNotice
                variant="light"
                className="max-w-2xl"
              />
            </div>

            <div className="rounded-3xl border border-white/90 bg-white/88 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Ready links
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {creativeResourceCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {creativeResourceGroups.map((group) => (
            <Card key={group.id} className="bg-white/94">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${group.accentClassName}`}
                  >
                    <group.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-slate-900">
                      {group.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                      {group.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-3">
                {group.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {resource.source}
                        </span>
                        <p className="text-lg font-semibold text-slate-900">
                          {resource.title}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-emerald-700" />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {resource.description}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                      Open link
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppSidebarLayout>
  )
}

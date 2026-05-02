import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { CreativeAttributionNotice } from "@/components/creative-attribution-notice"
import { AppSidebarLayout } from "@/components/app-sidebar-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  creativeIdeas,
  creativePageHighlights,
  creativeResourceCount,
  creativeResourceGroups,
} from "@/lib/creative-resources"

export default function CreatePage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Create" },
  ]

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_62%)]"
          />
          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <span className="admin-kicker">Resource workspace</span>
              <div className="space-y-2">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                  Curate design references inside a structured admin workspace.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  I grouped your links into one dashboard page so the team can
                  browse visual references quickly while designing onboarding,
                  banners, profile states, and message-themed screens.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="px-5">
                  <Link href="/dashboard/links">
                    Open link page
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-white/80 px-5">
                  <a
                    href="https://www.flaticon.com/free-icons/valentine"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Preview first reference
                    <ArrowUpRight />
                  </a>
                </Button>
              </div>

              <CreativeAttributionNotice
                variant="light"
                className="max-w-2xl"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {creativePageHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/80 bg-white/86 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                        {item.title}
                      </p>
                      <p className="text-2xl font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {creativeResourceGroups.map((group) => (
              <Card key={group.id} className="overflow-hidden bg-white/94">
                <CardHeader className="gap-3 border-b border-slate-100 pb-5">
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
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {group.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {resource.source}
                          </span>
                          <span className="text-[11px] font-medium tracking-[0.18em] text-emerald-600 uppercase">
                            External
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {resource.title}
                        </p>
                        <p className="text-sm leading-6 text-slate-600">
                          {resource.description}
                        </p>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-emerald-700" />
                    </a>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(240,253,250,0.92)_100%)]">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                How to use these links
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                Keep this page as the visual direction board for the dating app
                create work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="rounded-3xl border border-emerald-100 bg-white p-5">
                <p className="text-sm font-semibold tracking-[0.18em] text-emerald-600 uppercase">
                  Saved references
                </p>
                <p className="mt-2 text-4xl font-semibold text-slate-900">
                  {creativeResourceCount}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Every link is grouped and ready to open in a new tab from the
                  dedicated links page.
                </p>
              </div>

              <div className="space-y-3">
                {creativeIdeas.map((idea) => (
                  <div
                    key={idea}
                    className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                  >
                    {idea}
                  </div>
                ))}
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/links">
                  View redirect links
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppSidebarLayout>
  )
}

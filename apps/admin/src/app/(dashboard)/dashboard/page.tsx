import Link from "next/link"
import { ArrowRight, ArrowUpRight, Palette } from "lucide-react"

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
  creativeResourceCount,
  creativeResourceGroups,
} from "@/lib/creative-resources"

const quickLinks = [
  {
    title: "Create board",
    href: "/dashboard/create",
    description:
      "Browse the grouped icon, sticker, author, and wallpaper references.",
    icon: Palette,
  },
  {
    title: "Redirect links",
    href: "/dashboard/links",
    description:
      "Open every provided link from a dedicated page with redirect icons.",
    icon: ArrowUpRight,
  },
]

export default function DashboardPage() {
  const breadcrumbs = [{ title: "Dashboard" }]

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.3fr_0.92fr]">
            <div className="space-y-4">
              <span className="admin-kicker">
                Control center
              </span>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Run the admin with a calmer, cleaner dashboard inspired by Filament.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Creative resources, redirect links, and profile controls are now framed
                as focused admin panels instead of marketing-style cards.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="px-5">
                  <Link href="/dashboard/create">
                    Open create page
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="px-5">
                  <Link href="/dashboard/links">
                    Open links page
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="border-white/90 bg-white/88 shadow-none">
              <CardHeader className="border-b border-slate-100/90">
                <CardTitle className="text-xl text-slate-950">
                  System snapshot
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                  Shared assets and admin actions are grouped into focused work areas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pt-6 sm:grid-cols-3 lg:grid-cols-1">
                <div className="admin-panel-muted p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Total links
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">
                    {creativeResourceCount}
                  </p>
                </div>
                <div className="admin-panel-muted p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Groups
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">
                    {creativeResourceGroups.length}
                  </p>
                </div>
                <div className="admin-panel-muted p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Access
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    New tab redirects
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => (
              <Card key={item.title} className="bg-white/92">
                <CardHeader className="gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl text-slate-950">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-6 text-slate-600">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={item.href}>
                      Open page
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(240,253,250,0.95)_100%)]">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-950">Workspace notes</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                The updated shell is tuned for admin workflows: high contrast data, soft borders, and restrained accent color.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="admin-panel-muted p-4 text-sm leading-6 text-slate-600">
                Use `Create` to gather references without the old pink-heavy visual noise.
              </div>
              <div className="admin-panel-muted p-4 text-sm leading-6 text-slate-600">
                Use `Links` for direct resource access from a more table-like, structured presentation.
              </div>
              <div className="admin-panel-muted p-4 text-sm leading-6 text-slate-600">
                Use `Settings` for account updates inside the same Filament-inspired panel system.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppSidebarLayout>
  )
}

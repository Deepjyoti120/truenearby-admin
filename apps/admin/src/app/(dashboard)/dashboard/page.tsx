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
      <div className="space-y-4 pt-4">
        <section className="rounded-[2rem] border border-rose-200/70 bg-[linear-gradient(135deg,#fff7fa_0%,#fff0f5_45%,#fffaf4_100%)] p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-rose-700 uppercase">
                Dating app assets
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Your creative links are now organized inside the dashboard.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Use the Create page for inspiration and the Links page when you
                want direct redirects to the original resources.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild className="rounded-full bg-rose-600 px-5 text-white hover:bg-rose-500">
                  <Link href="/dashboard/create">
                    Open create page
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-rose-200 bg-white px-5 text-rose-700 hover:bg-rose-50">
                  <Link href="/dashboard/links">
                    Open links page
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="border-white/80 bg-white/85 shadow-none">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl text-slate-900">
                  Quick snapshot
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                  Everything from your shared URLs is grouped and ready to use.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pt-6 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Total links
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {creativeResourceCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Groups
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {creativeResourceGroups.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Access
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    New tab redirects
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((item) => (
            <Card key={item.title} className="border-slate-200/80 bg-white/95">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl text-slate-900">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full rounded-full border-rose-200 text-rose-700 hover:bg-rose-50">
                  <Link href={item.href}>
                    Open page
                    <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppSidebarLayout>
  )
}

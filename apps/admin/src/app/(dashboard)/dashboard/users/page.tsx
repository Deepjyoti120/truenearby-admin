import { Shield, UserRound, Users } from "lucide-react"

import { AppSidebarLayout } from "@/components/app-sidebar-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const userStats = [
  {
    title: "Admin access",
    value: "Protected",
    detail: "This area is routed through the authenticated admin shell.",
    icon: Shield,
  },
  {
    title: "Profile sync",
    value: "Live",
    detail: "Sidebar identity and settings are connected to your profile query.",
    icon: UserRound,
  },
  {
    title: "User module",
    value: "Ready",
    detail: "You can now extend this page with tables, filters, and bulk actions.",
    icon: Users,
  },
]

export default function UsersPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Users" },
  ]

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="admin-kicker">User management</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Prepare this section for Filament-style user administration.
            </h1>
            <p className="text-sm leading-7 text-slate-600 md:text-base">
              I upgraded the page shell so this route no longer looks like a placeholder.
              It now matches the rest of the dashboard and is ready for tables, filters,
              empty states, and action bars.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {userStats.map((item) => (
            <Card key={item.title} className="bg-white/94">
              <CardHeader className="gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm leading-6 text-slate-600">
                    {item.detail}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-slate-950">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppSidebarLayout>
  )
}

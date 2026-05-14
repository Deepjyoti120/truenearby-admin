"use client"

import {
  Activity,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserRound,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { AppSidebarLayout } from "@/components/app-sidebar-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { AdminUserStats } from "@/features/stats/api"
import { useUserStatsQuery } from "@/features/stats/query"

type ToneKey = "emerald" | "rose" | "sky" | "violet" | "amber" | "cyan" | "slate" | "lime"

const TONE_STYLES: Record<
  ToneKey,
  { card: string; icon: string; bar: string; chip: string }
> = {
  emerald: {
    card: "bg-[linear-gradient(140deg,rgba(236,253,245,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-emerald-100/80",
    icon: "bg-emerald-100 text-emerald-700 ring-emerald-200/70",
    bar: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  rose: {
    card: "bg-[linear-gradient(140deg,rgba(255,241,242,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-rose-100/80",
    icon: "bg-rose-100 text-rose-700 ring-rose-200/70",
    bar: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  sky: {
    card: "bg-[linear-gradient(140deg,rgba(240,249,255,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-sky-100/80",
    icon: "bg-sky-100 text-sky-700 ring-sky-200/70",
    bar: "bg-sky-500",
    chip: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  violet: {
    card: "bg-[linear-gradient(140deg,rgba(245,243,255,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-violet-100/80",
    icon: "bg-violet-100 text-violet-700 ring-violet-200/70",
    bar: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  amber: {
    card: "bg-[linear-gradient(140deg,rgba(255,251,235,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-amber-100/80",
    icon: "bg-amber-100 text-amber-700 ring-amber-200/70",
    bar: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  cyan: {
    card: "bg-[linear-gradient(140deg,rgba(236,254,255,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-cyan-100/80",
    icon: "bg-cyan-100 text-cyan-700 ring-cyan-200/70",
    bar: "bg-cyan-500",
    chip: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  slate: {
    card: "bg-[linear-gradient(140deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-slate-200/70",
    icon: "bg-slate-100 text-slate-700 ring-slate-200/70",
    bar: "bg-slate-500",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  lime: {
    card: "bg-[linear-gradient(140deg,rgba(247,254,231,0.95)_0%,rgba(255,255,255,0.95)_60%)] ring-lime-100/80",
    icon: "bg-lime-100 text-lime-700 ring-lime-200/70",
    bar: "bg-lime-500",
    chip: "bg-lime-50 text-lime-700 ring-lime-100",
  },
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined).format(n)
}

function pct(part: number, total: number) {
  if (!total) return 0
  return Math.round((part / total) * 1000) / 10
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  caption,
  share,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone: ToneKey
  caption?: string
  share?: number
}) {
  const styles = TONE_STYLES[tone]
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/60 p-5 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.45)] ring-1 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_70px_-30px_rgba(15,23,42,0.5)] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
            {label}
          </p>
          <p className="text-4xl font-semibold tracking-tight text-slate-950">
            {formatNumber(value)}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {typeof share === "number" ? (
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>Share of total</span>
            <span className="font-semibold text-slate-700">{share}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70 ring-1 ring-black/[0.04]">
            <div
              className={`h-full rounded-full transition-all ${styles.bar}`}
              style={{ width: `${Math.min(100, share)}%` }}
            />
          </div>
        </div>
      ) : caption ? (
        <p className="mt-5 text-xs leading-5 text-slate-500">{caption}</p>
      ) : (
        <div className="mt-5 h-1.5" />
      )}
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-11 w-11 rounded-2xl" />
      </div>
      <Skeleton className="mt-6 h-1.5 w-full rounded-full" />
    </div>
  )
}

function GenderBreakdown({ stats }: { stats: AdminUserStats }) {
  const { male, female, other } = stats.gender
  const sum = male + female + other || 1
  const rows: Array<{ key: ToneKey; label: string; value: number }> = [
    { key: "rose", label: "Female", value: female },
    { key: "sky", label: "Male", value: male },
    { key: "slate", label: "Other", value: other },
  ]

  return (
    <div className="admin-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Gender distribution
          </h3>
          <p className="text-sm text-slate-500">
            Breakdown of all {formatNumber(stats.total)} users with a profile.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-700 ring-1 ring-emerald-100 uppercase">
          <Activity className="h-3 w-3" /> Live
        </span>
      </div>

      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full ring-1 ring-black/[0.04]">
        {rows.map((row) => {
          const styles = TONE_STYLES[row.key]
          const width = (row.value / sum) * 100
          if (width <= 0) return null
          return (
            <div
              key={row.label}
              className={`${styles.bar} h-full transition-all`}
              style={{ width: `${width}%` }}
              title={`${row.label}: ${formatNumber(row.value)}`}
            />
          )
        })}
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {rows.map((row) => {
          const styles = TONE_STYLES[row.key]
          const share = pct(row.value, sum)
          return (
            <li
              key={row.label}
              className="rounded-2xl border border-slate-100 bg-white/80 p-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ${styles.chip}`}
                >
                  <span className={`h-2 w-2 rounded-full ${styles.bar}`} />
                  {row.label}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {share}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {formatNumber(row.value)}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ActivityPanel({ stats }: { stats: AdminUserStats }) {
  const activeShare = pct(stats.active, stats.total)
  return (
    <div className="admin-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Account status
          </h3>
          <p className="text-sm text-slate-500">
            How many users currently have access enabled.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70">
          <UserCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-800 uppercase">
            Active
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">
            {formatNumber(stats.active)}
          </p>
          <p className="mt-1 text-xs text-emerald-700/80">
            {activeShare}% of total
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 uppercase">
            Inactive
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">
            {formatNumber(stats.inactive)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {pct(stats.inactive, stats.total)}% of total
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-black/[0.03]">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.min(100, activeShare)}%` }}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const breadcrumbs = [{ title: "Dashboard" }]
  const { data: stats, isLoading, isError, error, refetch, isFetching } =
    useUserStatsQuery()

  const lastUpdated = stats
    ? new Date(stats.generatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <span className="admin-kicker">Statistics</span>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Statistics overview
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Real-time snapshot of users, gender split, and recent signup
                activity across the application.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {lastUpdated ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  Updated {lastUpdated}
                </span>
              ) : null}
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </div>
        </section>

        {isError ? (
          <div className="admin-panel flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Could not load statistics
              </p>
              <p className="text-sm text-slate-500">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred."}
              </p>
            </div>
            <Button onClick={() => refetch()}>Try again</Button>
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading || !stats ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <StatCardSkeleton key={`top-${idx}`} />
            ))
          ) : (
            <>
              <StatCard
                label="Total users"
                value={stats.total}
                icon={Users}
                tone="emerald"
                caption="All accounts with the user role."
              />
              <StatCard
                label="Female"
                value={stats.gender.female}
                icon={UserRound}
                tone="rose"
                share={pct(stats.gender.female, stats.total)}
              />
              <StatCard
                label="Male"
                value={stats.gender.male}
                icon={UserRound}
                tone="sky"
                share={pct(stats.gender.male, stats.total)}
              />
              <StatCard
                label="This month"
                value={stats.signups.thisMonth}
                icon={TrendingUp}
                tone="violet"
                caption="New signups since the 1st of the month."
              />
            </>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading || !stats ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <StatCardSkeleton key={`bottom-${idx}`} />
            ))
          ) : (
            <>
              <StatCard
                label="Today"
                value={stats.signups.today}
                icon={CalendarClock}
                tone="amber"
                caption="Signups in the last 24 hours."
              />
              <StatCard
                label="This week"
                value={stats.signups.thisWeek}
                icon={CalendarDays}
                tone="cyan"
                caption="Signups in the last 7 days."
              />
              <StatCard
                label="Other gender"
                value={stats.gender.other}
                icon={CalendarRange}
                tone="lime"
                share={pct(stats.gender.other, stats.total)}
              />
              <StatCard
                label="Inactive"
                value={stats.inactive}
                icon={UserMinus}
                tone="slate"
                share={pct(stats.inactive, stats.total)}
              />
            </>
          )}
        </section>

        {stats ? (
          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <GenderBreakdown stats={stats} />
            <ActivityPanel stats={stats} />
          </section>
        ) : null}
      </div>
    </AppSidebarLayout>
  )
}

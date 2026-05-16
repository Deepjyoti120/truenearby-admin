"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { AppSidebarLayout } from "@/components/app-sidebar-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useIsEditAccess } from "@/features/read-only-admin/state"
import {
  PLAN_TIERS,
  type AdminSubscriptionPlanRow,
  type PlanTier,
} from "@/features/subscriptions/api"
import {
  usePlansQuery,
  useSetPlanActiveMutation,
} from "@/features/subscriptions/query"
import { SubscriptionFormSheet } from "@/features/subscriptions/subscription-form-sheet"

const PAGE_SIZE = 10

const TIER_ANY = "ALL"
type TierInput = PlanTier | typeof TIER_ANY

const ACTIVE_ANY = "ALL"
const ACTIVE_ACTIVE = "true"
const ACTIVE_INACTIVE = "false"
type ActiveInput =
  | typeof ACTIVE_ANY
  | typeof ACTIVE_ACTIVE
  | typeof ACTIVE_INACTIVE

type PageToken = number | "ellipsis-start" | "ellipsis-end"

function buildPageList(current: number, total: number): PageToken[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const tokens: PageToken[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  if (left > 2) tokens.push("ellipsis-start")
  for (let i = left; i <= right; i++) tokens.push(i)
  if (right < total - 1) tokens.push("ellipsis-end")
  tokens.push(total)
  return tokens
}

function countActiveFeatures(plan: AdminSubscriptionPlanRow): number {
  const f = plan.features
  return [
    f.canReverseLastSwipe,
    f.canChangeSwipeDecision,
    f.canSeeWhoLikedYou,
    f.showLikesInAdvancedHome,
    f.canUnblurLikes,
    f.canPassport,
    f.hideAds,
  ].filter(Boolean).length
}

function PlanRowItem({
  plan,
  onToggle,
  onEdit,
  isPending,
}: {
  plan: AdminSubscriptionPlanRow
  onToggle: (next: boolean) => void
  onEdit: () => void
  isPending: boolean
}) {
  const activeFeatures = countActiveFeatures(plan)
  const isFree = plan.isDefault

  return (
    <TableRow>
      <TableCell className="pl-6 font-medium text-slate-900">
        <div className="flex flex-col">
          <span>{plan.name}</span>
          {plan.description ? (
            <span className="text-xs text-slate-500">{plan.description}</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold tracking-wide text-slate-700 uppercase">
          {plan.plan}
        </span>
        {isFree ? (
          <span className="ml-2 inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase">
            Default
          </span>
        ) : null}
      </TableCell>
      <TableCell className="text-slate-700">{plan.durationDays} days</TableCell>
      <TableCell className="text-slate-700">
        {plan.features.dailySwipeLimit}/day
      </TableCell>
      <TableCell className="text-slate-700">
        {activeFeatures} feature{activeFeatures === 1 ? "" : "s"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={plan.isActive}
            onCheckedChange={onToggle}
            disabled={isPending || isFree}
            aria-label={plan.isActive ? "Deactivate plan" : "Activate plan"}
          />
          <span
            className={`text-xs font-medium ${
              plan.isActive ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </TableCell>
      <TableCell className="pr-6 text-right">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </TableCell>
    </TableRow>
  )
}

type AppliedFilters = {
  search: string
  tier: TierInput
  active: ActiveInput
}

export default function SubscriptionsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Subscriptions" },
  ]

  const [searchInput, setSearchInput] = useState("")
  const [tierInput, setTierInput] = useState<TierInput>(TIER_ANY)
  const [activeInput, setActiveInput] = useState<ActiveInput>(ACTIVE_ANY)
  const [applied, setApplied] = useState<AppliedFilters>({
    search: "",
    tier: TIER_ANY,
    active: ACTIVE_ANY,
  })
  const [page, setPage] = useState(1)
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPlan, setEditingPlan] =
    useState<AdminSubscriptionPlanRow | null>(null)

  const queryInput = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: applied.search || undefined,
      code: applied.tier === TIER_ANY ? undefined : (applied.tier as PlanTier),
      isActive:
        applied.active === ACTIVE_ANY
          ? undefined
          : applied.active === ACTIVE_ACTIVE,
    }),
    [page, applied],
  )

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePlansQuery(queryInput)
  const activeMutation = useSetPlanActiveMutation()
  // Matches users page convention: the hook name is misleading — it returns
  // `true` when the account is in restricted/read-only mode. Click handlers
  // toast and short-circuit; we never visually disable based on this.
  const isReadOnly = useIsEditAccess()

  const rows = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1
  const total = data?.meta.total ?? 0
  const pageTokens = buildPageList(page, totalPages)

  const isStaged =
    searchInput.trim() !== applied.search ||
    tierInput !== applied.tier ||
    activeInput !== applied.active

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setApplied({
      search: searchInput.trim(),
      tier: tierInput,
      active: activeInput,
    })
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput("")
    setTierInput(TIER_ANY)
    setActiveInput(ACTIVE_ANY)
    setApplied({ search: "", tier: TIER_ANY, active: ACTIVE_ANY })
    setPage(1)
  }

  const handleToggle = (plan: AdminSubscriptionPlanRow, next: boolean) => {
    if (isReadOnly) {
      toast.error("Editing is disabled for this account")
      return
    }
    if (plan.isDefault && !next) {
      toast.error("The FREE plan cannot be deactivated")
      return
    }
    activeMutation.mutate(
      { id: plan.planId, isActive: next },
      {
        onSuccess: () => {
          toast.success(next ? "Plan activated" : "Plan deactivated", {
            description: plan.name,
          })
        },
        onError: (err) => {
          toast.error("Could not update plan", {
            description: err instanceof Error ? err.message : "Unknown error",
          })
        },
      },
    )
  }

  const openCreate = () => {
    if (isReadOnly) {
      toast.error("Editing is disabled for this account")
      return
    }
    setSheetMode("create")
    setEditingPlan(null)
    setSheetOpen(true)
  }

  const openEdit = (plan: AdminSubscriptionPlanRow) => {
    if (isReadOnly) {
      toast.error("Editing is disabled for this account")
      return
    }
    setSheetMode("edit")
    setEditingPlan(plan)
    setSheetOpen(true)
  }

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="admin-kicker">Subscription catalog</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Manage subscription plans
            </h1>
            <p className="text-sm leading-7 text-slate-600 md:text-base">
              Sell multiple durations per tier (e.g. 7-day Gold + 30-day Gold).
              The FREE plan is system-managed — it cannot be deleted or
              deactivated.
            </p>
          </div>
        </section>

        <Card className="bg-white/94">
          <CardHeader className="gap-4 border-b border-slate-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg text-slate-900">Plans</CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                  {isLoading
                    ? "Loading plans…"
                    : `${total} plan${total === 1 ? "" : "s"} found`}
                </CardDescription>
              </div>
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New plan
              </Button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or description"
                  className="pl-9"
                  aria-label="Search plans"
                />
              </div>

              <Select
                value={tierInput}
                onValueChange={(v) => setTierInput(v as TierInput)}
              >
                <SelectTrigger className="sm:w-40" aria-label="Filter by tier">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TIER_ANY}>All tiers</SelectItem>
                  {PLAN_TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={activeInput}
                onValueChange={(v) => setActiveInput(v as ActiveInput)}
              >
                <SelectTrigger
                  className="sm:w-40"
                  aria-label="Filter by status"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ACTIVE_ANY}>All statuses</SelectItem>
                  <SelectItem value={ACTIVE_ACTIVE}>Active only</SelectItem>
                  <SelectItem value={ACTIVE_INACTIVE}>Inactive only</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 sm:ml-auto">
                <Button type="submit" disabled={!isStaged && !isFetching}>
                  Search
                </Button>
                {(applied.search ||
                  applied.tier !== TIER_ANY ||
                  applied.active !== ACTIVE_ANY) && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="pl-6">Plan</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Daily swipes</TableHead>
                  <TableHead>Features on</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <Skeleton className="ml-auto h-8 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-slate-600"
                    >
                      <div className="space-y-2">
                        <p>
                          {error instanceof Error
                            ? error.message
                            : "Failed to load subscription plans."}
                        </p>
                        <button
                          type="button"
                          onClick={() => refetch()}
                          className="text-emerald-700 underline-offset-4 hover:underline"
                        >
                          Try again
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      {applied.search ||
                      applied.tier !== TIER_ANY ||
                      applied.active !== ACTIVE_ANY
                        ? "No plans match the current filters."
                        : "No plans found yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((plan) => (
                    <PlanRowItem
                      key={plan.planId}
                      plan={plan}
                      isPending={
                        activeMutation.isPending &&
                        activeMutation.variables?.id === plan.planId
                      }
                      onToggle={(next) => handleToggle(plan, next)}
                      onEdit={() => openEdit(plan)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {!isLoading && !isError && rows.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages}
                {isFetching ? " · refreshing…" : ""}
              </p>

              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    />
                  </PaginationItem>
                  {pageTokens.map((token) =>
                    token === "ellipsis-start" || token === "ellipsis-end" ? (
                      <PaginationItem key={token}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={token}>
                        <PaginationLink
                          isActive={token === page}
                          onClick={() => setPage(token)}
                        >
                          {token}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </Card>
      </div>

      <SubscriptionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        plan={editingPlan}
      />
    </AppSidebarLayout>
  )
}

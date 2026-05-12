"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { AppSidebarLayout } from "@/components/app-sidebar-layout"
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
import type { AdminUserRow } from "@/features/users/api"
import {
  useSetUserActiveMutation,
  useUsersQuery,
} from "@/features/users/query"

const PAGE_SIZE = 10

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

type PageToken = number | "ellipsis-start" | "ellipsis-end"

function buildPageList(current: number, total: number): PageToken[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const tokens: PageToken[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  if (left > 2) {
    tokens.push("ellipsis-start")
  }
  for (let i = left; i <= right; i++) {
    tokens.push(i)
  }
  if (right < total - 1) {
    tokens.push("ellipsis-end")
  }
  tokens.push(total)
  return tokens
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function UserRowItem({
  user,
  onToggle,
  isPending,
}: {
  user: AdminUserRow
  onToggle: (next: boolean) => void
  isPending: boolean
}) {
  return (
    <TableRow>
      <TableCell className="font-medium text-slate-900">
        {user.name ?? "—"}
      </TableCell>
      <TableCell className="text-slate-700">{user.email}</TableCell>
      <TableCell className="text-slate-700">{user.phone ?? "—"}</TableCell>
      <TableCell className="text-slate-500">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={user.isActive}
            onCheckedChange={onToggle}
            disabled={isPending}
            aria-label={user.isActive ? "Deactivate user" : "Activate user"}
          />
          <span
            className={`text-xs font-medium ${
              user.isActive ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function UsersPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Users" },
  ]

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput, 300)
  const [lastAppliedSearch, setLastAppliedSearch] = useState(search)

  if (lastAppliedSearch !== search) {
    setLastAppliedSearch(search)
    setPage(1)
  }

  const queryInput = useMemo(
    () => ({ page, limit: PAGE_SIZE, search: search || undefined }),
    [page, search],
  )

  const { data, isLoading, isFetching, isError, error, refetch } =
    useUsersQuery(queryInput)
  const mutation = useSetUserActiveMutation()

  const rows = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1
  const total = data?.meta.total ?? 0
  const pageTokens = buildPageList(page, totalPages)

  const handleToggle = (user: AdminUserRow, next: boolean) => {
    mutation.mutate(
      { id: user.id, isActive: next },
      {
        onSuccess: () => {
          toast.success(
            next ? "User activated" : "User deactivated",
            { description: user.email },
          )
        },
        onError: (err) => {
          toast.error("Could not update user", {
            description: err instanceof Error ? err.message : "Unknown error",
          })
        },
      },
    )
  }

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="admin-kicker">User management</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Manage application users
            </h1>
            <p className="text-sm leading-7 text-slate-600 md:text-base">
              Only accounts with the user role are listed here. Toggle a row to
              activate or deactivate access.
            </p>
          </div>
        </section>

        <Card className="bg-white/94">
          <CardHeader className="gap-4 border-b border-slate-100 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg text-slate-900">Users</CardTitle>
              <CardDescription className="mt-1 text-sm leading-6 text-slate-600">
                {isLoading
                  ? "Loading users…"
                  : `${total} user${total === 1 ? "" : "s"} found`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by email or phone"
                className="pl-9"
                aria-label="Search users"
              />
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-44" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-600"
                    >
                      <div className="space-y-2">
                        <p>
                          {error instanceof Error
                            ? error.message
                            : "Failed to load users."}
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
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      {search
                        ? `No users match "${search}".`
                        : "No users found yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((user) => (
                    <UserRowItem
                      key={user.id}
                      user={user}
                      isPending={
                        mutation.isPending && mutation.variables?.id === user.id
                      }
                      onToggle={(next) => handleToggle(user, next)}
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
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </Card>
      </div>
    </AppSidebarLayout>
  )
}

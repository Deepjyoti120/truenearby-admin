"use client"

import { useEffect, useState } from "react"
import {
  BadgeCheck,
  Ban,
  Check,
  Images,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react"
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
import type { AdminPostRow, PostVerifiedFilter } from "@/features/posts/api"
import {
  usePostsQuery,
  useSetPostActiveMutation,
  useSetPostOwnerActiveMutation,
  useSetPostVerifiedMutation,
  useVerifyPostsMutation,
} from "@/features/posts/query"

const PAGE_SIZE = 20

const VERIFIED_OPTIONS: { value: PostVerifiedFilter; label: string }[] = [
  { value: "unverified", label: "Not verified" },
  { value: "verified", label: "Verified" },
  { value: "all", label: "All" },
]

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

function PostTile({
  post,
  onZoom,
  onVerify,
  onDeactivate,
  onBlockUser,
  busy,
}: {
  post: AdminPostRow
  onZoom: () => void
  onVerify: () => void
  onDeactivate: () => void
  onBlockUser: () => void
  busy: boolean
}) {
  const label = post.ownerName || post.ownerEmail || "Unknown user"
  const cover = post.imageUrls[0]

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 focus-within:ring-2 focus-within:ring-emerald-500">
      <button
        type="button"
        onClick={onZoom}
        className="absolute inset-0 focus:outline-none"
        aria-label={`Open post from ${label}`}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`Post from ${label}`}
            loading="lazy"
            className={`size-full object-cover transition-transform duration-200 group-hover:scale-105 ${
              post.isActive ? "" : "opacity-40 grayscale"
            }`}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-xs text-slate-400">
            No image
          </span>
        )}
      </button>

      <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
        {post.imageUrls.length > 1 ? (
          <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
            <Images className="size-3" /> {post.imageUrls.length}
          </span>
        ) : null}
        {post.isVerified ? (
          <span className="flex items-center gap-1 rounded-full bg-sky-600/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
            <BadgeCheck className="size-3" /> Verified
          </span>
        ) : null}
        {!post.isActive ? (
          <span className="rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
            Inactive
          </span>
        ) : null}
        {!post.ownerIsActive ? (
          <span className="flex items-center gap-1 rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
            <UserX className="size-3" /> User blocked
          </span>
        ) : null}
      </div>

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        {!post.isVerified ? (
          <button
            type="button"
            onClick={onVerify}
            disabled={busy}
            title="Verify post"
            aria-label="Verify post"
            className="rounded-full bg-white/90 p-1.5 text-emerald-700 shadow-sm transition-colors hover:bg-white disabled:opacity-50"
          >
            <Check className="size-4" />
          </button>
        ) : null}
        {post.isActive ? (
          <button
            type="button"
            onClick={onDeactivate}
            disabled={busy}
            title="Deactivate post"
            aria-label="Deactivate post"
            className="rounded-full bg-white/90 p-1.5 text-rose-700 shadow-sm transition-colors hover:bg-white disabled:opacity-50"
          >
            <Ban className="size-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onBlockUser}
          disabled={busy}
          title={post.ownerIsActive ? "Block user" : "Unblock user"}
          aria-label={post.ownerIsActive ? "Block user" : "Unblock user"}
          className="rounded-full bg-white/90 p-1.5 text-slate-800 shadow-sm transition-colors hover:bg-white disabled:opacity-50"
        >
          {post.ownerIsActive ? (
            <UserX className="size-4" />
          ) : (
            <UserCheck className="size-4" />
          )}
        </button>
      </div>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 py-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {post.prompt ? post.prompt : label}
      </span>
    </div>
  )
}

function PostLightbox({
  post,
  onClose,
}: {
  post: AdminPostRow
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const label = post.ownerName || post.ownerEmail || "Unknown user"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Post from ${label}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>
      <figure
        className="flex max-h-full w-full max-w-3xl flex-col items-center gap-3 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {post.imageUrls.map((url, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`Post image ${idx + 1} from ${label}`}
              className="max-h-[70vh] w-full rounded-lg object-contain shadow-2xl"
            />
          ))}
        </div>
        <figcaption className="text-center text-sm text-white/80">
          {post.prompt ? (
            <span className="block pb-1 text-white">{post.prompt}</span>
          ) : null}
          {label}
          {post.ownerEmail && post.ownerName ? (
            <span className="block text-xs text-white/50">
              {post.ownerEmail}
            </span>
          ) : null}
        </figcaption>
      </figure>
    </div>
  )
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  confirmLabel: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PostsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Posts" },
  ]

  const [searchInput, setSearchInput] = useState("")
  const [applied, setApplied] = useState("")
  const [verified, setVerified] = useState<PostVerifiedFilter>("unverified")
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<AdminPostRow | null>(null)
  const [pendingDeactivate, setPendingDeactivate] =
    useState<AdminPostRow | null>(null)
  const [pendingBlock, setPendingBlock] = useState<AdminPostRow | null>(null)

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePostsQuery({
      page,
      limit: PAGE_SIZE,
      search: applied || undefined,
      verified,
    })

  const verifyOne = useSetPostVerifiedMutation()
  const verifyAll = useVerifyPostsMutation()
  const setPostActive = useSetPostActiveMutation()
  const setOwnerActive = useSetPostOwnerActiveMutation()

  const posts = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1
  const total = data?.meta.total ?? 0
  const pageTokens = buildPageList(page, totalPages)

  const unverifiedOnPage = posts.filter((p) => !p.isVerified)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setApplied(searchInput.trim())
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput("")
    setApplied("")
    setVerified("unverified")
    setPage(1)
  }

  const handleVerifyOne = (post: AdminPostRow) => {
    verifyOne.mutate(
      { id: post.id, isVerified: true },
      {
        onSuccess: () => toast.success("Post verified"),
        onError: (err) =>
          toast.error("Could not verify post", {
            description: err instanceof Error ? err.message : "Unknown error",
          }),
      },
    )
  }

  const handleVerifyAll = () => {
    const ids = unverifiedOnPage.map((p) => p.id)
    if (ids.length === 0) return
    verifyAll.mutate(
      { ids, isVerified: true },
      {
        onSuccess: () =>
          toast.success(`Verified ${ids.length} post${ids.length === 1 ? "" : "s"}`),
        onError: (err) =>
          toast.error("Could not verify posts", {
            description: err instanceof Error ? err.message : "Unknown error",
          }),
      },
    )
  }

  const handleConfirmDeactivate = () => {
    if (!pendingDeactivate) return
    const post = pendingDeactivate
    setPostActive.mutate(
      { id: post.id, isActive: false },
      {
        onSuccess: () => {
          toast.success("Post deactivated")
          setPendingDeactivate(null)
        },
        onError: (err) => {
          toast.error("Could not deactivate post", {
            description: err instanceof Error ? err.message : "Unknown error",
          })
          setPendingDeactivate(null)
        },
      },
    )
  }

  const handleConfirmBlock = () => {
    if (!pendingBlock) return
    const post = pendingBlock
    const nextActive = !post.ownerIsActive
    setOwnerActive.mutate(
      { id: post.userId, isActive: nextActive },
      {
        onSuccess: () => {
          toast.success(nextActive ? "User unblocked" : "User blocked", {
            description: post.ownerEmail ?? undefined,
          })
          setPendingBlock(null)
        },
        onError: (err) => {
          toast.error("Could not update user", {
            description: err instanceof Error ? err.message : "Unknown error",
          })
          setPendingBlock(null)
        },
      },
    )
  }

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="admin-kicker">Post library</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Browse user posts
            </h1>
            <p className="text-sm leading-7 text-slate-600 md:text-base">
              Posts shared by application users. Click any post to view all of
              its images.
            </p>
          </div>
        </section>

        <Card className="bg-white/94">
          <CardHeader className="gap-4 border-b border-slate-100">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg text-slate-900">Posts</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                {isLoading
                  ? "Loading posts…"
                  : `${total} post${total === 1 ? "" : "s"} found`}
              </CardDescription>
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
                  placeholder="Search by owner name or email"
                  className="pl-9"
                  aria-label="Search posts"
                />
              </div>

              <Select
                value={verified}
                onValueChange={(v) => {
                  setVerified(v as PostVerifiedFilter)
                  setPage(1)
                }}
              >
                <SelectTrigger
                  className="sm:w-44"
                  aria-label="Filter by verification"
                >
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  {VERIFIED_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 sm:ml-auto">
                <Button
                  type="submit"
                  disabled={searchInput.trim() === applied && !isFetching}
                >
                  Search
                </Button>
                {applied || verified !== "unverified" ? (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                ) : null}
              </div>
            </form>

            {unverifiedOnPage.length > 0 ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-600">
                  {unverifiedOnPage.length} unverified post
                  {unverifiedOnPage.length === 1 ? "" : "s"} on this page
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleVerifyAll}
                  disabled={verifyAll.isPending}
                >
                  <BadgeCheck className="size-4" />
                  {verifyAll.isPending ? "Verifying…" : "Verify all on page"}
                </Button>
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <Skeleton
                    key={`skeleton-${idx}`}
                    className="aspect-square w-full rounded-xl"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="space-y-2 py-10 text-center text-sm text-slate-600">
                <p>
                  {error instanceof Error
                    ? error.message
                    : "Failed to load posts."}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-emerald-700 underline-offset-4 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {applied || verified !== "all"
                  ? "No posts match the current filters."
                  : "No posts found yet."}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {posts.map((post) => (
                  <PostTile
                    key={post.id}
                    post={post}
                    onZoom={() => setActive(post)}
                    onVerify={() => handleVerifyOne(post)}
                    onDeactivate={() => setPendingDeactivate(post)}
                    onBlockUser={() => setPendingBlock(post)}
                    busy={
                      (verifyOne.isPending &&
                        verifyOne.variables?.id === post.id) ||
                      (setPostActive.isPending &&
                        setPostActive.variables?.id === post.id) ||
                      (setOwnerActive.isPending &&
                        setOwnerActive.variables?.id === post.userId)
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>

          {!isLoading && !isError && posts.length > 0 ? (
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

      {active ? (
        <PostLightbox post={active} onClose={() => setActive(null)} />
      ) : null}

      {pendingDeactivate ? (
        <ConfirmDialog
          title="Deactivate post?"
          description={`This post from ${
            pendingDeactivate.ownerName ||
            pendingDeactivate.ownerEmail ||
            "this user"
          } will be deactivated and hidden from the app.`}
          confirmLabel="Deactivate"
          busy={setPostActive.isPending}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setPendingDeactivate(null)}
        />
      ) : null}

      {pendingBlock ? (
        <ConfirmDialog
          title={pendingBlock.ownerIsActive ? "Block user?" : "Unblock user?"}
          description={
            pendingBlock.ownerIsActive
              ? `${
                  pendingBlock.ownerName || pendingBlock.ownerEmail || "This user"
                } will be deactivated and lose access to the app.`
              : `${
                  pendingBlock.ownerName || pendingBlock.ownerEmail || "This user"
                } will be reactivated and regain access.`
          }
          confirmLabel={
            pendingBlock.ownerIsActive ? "Block user" : "Unblock user"
          }
          busy={setOwnerActive.isPending}
          onConfirm={handleConfirmBlock}
          onCancel={() => setPendingBlock(null)}
        />
      ) : null}
    </AppSidebarLayout>
  )
}

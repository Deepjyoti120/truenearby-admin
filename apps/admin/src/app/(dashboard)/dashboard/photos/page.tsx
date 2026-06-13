"use client"

import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import type { AdminPhotoRow } from "@/features/photos/api"
import { usePhotosQuery } from "@/features/photos/query"

const PAGE_SIZE = 20

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

function PhotoTile({
  photo,
  onZoom,
}: {
  photo: AdminPhotoRow
  onZoom: () => void
}) {
  const label = photo.ownerName || photo.ownerEmail || "Unknown user"
  return (
    <button
      type="button"
      onClick={onZoom}
      className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label={`Zoom photo from ${label}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`Photo from ${label}`}
        loading="lazy"
        className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      {photo.isPrimary ? (
        <span className="absolute left-2 top-2 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          Primary
        </span>
      ) : null}
      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 py-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}

function Lightbox({
  photo,
  onClose,
}: {
  photo: AdminPhotoRow
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

  const label = photo.ownerName || photo.ownerEmail || "Unknown user"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo from ${label}`}
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
        className="flex max-h-full max-w-3xl flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={`Photo from ${label}`}
          className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
        />
        <figcaption className="text-center text-sm text-white/80">
          {label}
          {photo.ownerEmail && photo.ownerName ? (
            <span className="block text-xs text-white/50">
              {photo.ownerEmail}
            </span>
          ) : null}
        </figcaption>
      </figure>
    </div>
  )
}

export default function PhotosPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Photos" },
  ]

  const [searchInput, setSearchInput] = useState("")
  const [applied, setApplied] = useState("")
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<AdminPhotoRow | null>(null)

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePhotosQuery({
      page,
      limit: PAGE_SIZE,
      search: applied || undefined,
    })

  const photos = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1
  const total = data?.meta.total ?? 0
  const pageTokens = buildPageList(page, totalPages)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setApplied(searchInput.trim())
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput("")
    setApplied("")
    setPage(1)
  }

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <section className="admin-hero p-6 md:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="admin-kicker">Photo library</span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Browse user photos
            </h1>
            <p className="text-sm leading-7 text-slate-600 md:text-base">
              Photos uploaded by application users. Click any photo to zoom in.
            </p>
          </div>
        </section>

        <Card className="bg-white/94">
          <CardHeader className="gap-4 border-b border-slate-100">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg text-slate-900">Photos</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                {isLoading
                  ? "Loading photos…"
                  : `${total} photo${total === 1 ? "" : "s"} found`}
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
                  aria-label="Search photos"
                />
              </div>

              <div className="flex gap-2 sm:ml-auto">
                <Button
                  type="submit"
                  disabled={searchInput.trim() === applied && !isFetching}
                >
                  Search
                </Button>
                {applied ? (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                ) : null}
              </div>
            </form>
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
                    : "Failed to load photos."}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-emerald-700 underline-offset-4 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : photos.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {applied
                  ? "No photos match the current search."
                  : "No photos found yet."}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {photos.map((photo) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    onZoom={() => setActive(photo)}
                  />
                ))}
              </div>
            )}
          </CardContent>

          {!isLoading && !isError && photos.length > 0 ? (
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

      {active ? <Lightbox photo={active} onClose={() => setActive(null)} /> : null}
    </AppSidebarLayout>
  )
}

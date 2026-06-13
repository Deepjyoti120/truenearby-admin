import { apiFetch, parseApiError } from "@/lib/api"

export type PostVerifiedFilter = "verified" | "unverified" | "all"

export type AdminPostRow = {
  id: string
  prompt: string | null
  imageUrls: string[]
  isVerified: boolean
  isActive: boolean
  createdAt: string
  userId: string
  ownerEmail: string | null
  ownerName: string | null
  ownerIsActive: boolean
}

export type ListPostsResponse = {
  data: AdminPostRow[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type Envelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

export type ListPostsInput = {
  page?: number
  limit?: number
  search?: string
  verified?: PostVerifiedFilter
}

export async function fetchPosts(
  input: ListPostsInput,
): Promise<ListPostsResponse> {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.limit) params.set("limit", String(input.limit))
  if (input.search?.trim()) params.set("search", input.search.trim())
  if (input.verified) params.set("verified", input.verified)

  const qs = params.toString()
  const res = await apiFetch(`/api/v1/posts/admin${qs ? `?${qs}` : ""}`)

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load posts"))
  }

  const body = (await res.json()) as Envelope<ListPostsResponse>
  if (!body?.data) {
    throw new Error("Invalid posts response returned from API")
  }
  return body.data
}

export async function setPostVerified(postId: string, isVerified: boolean) {
  const res = await apiFetch(`/api/v1/posts/admin/${postId}/verify`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isVerified }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update post"))
  }
  return (await res.json()) as Envelope<{ id: string; isVerified: boolean }>
}

export async function verifyPosts(ids: string[], isVerified = true) {
  const res = await apiFetch(`/api/v1/posts/admin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, isVerified }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to verify posts"))
  }
  return (await res.json()) as Envelope<{ count: number; isVerified: boolean }>
}

export async function setPostActive(postId: string, isActive: boolean) {
  const res = await apiFetch(`/api/v1/posts/admin/${postId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update post"))
  }
  return (await res.json()) as Envelope<{ id: string; isActive: boolean }>
}

import { apiFetch, parseApiError } from "@/lib/api"

export type PhotoVerifiedFilter = "verified" | "unverified" | "all"

export type AdminPhotoRow = {
  id: string
  url: string
  isPrimary: boolean
  isVerified: boolean
  isActive: boolean
  createdAt: string
  userId: string
  ownerEmail: string | null
  ownerName: string | null
}

export type ListPhotosResponse = {
  data: AdminPhotoRow[]
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

export type ListPhotosInput = {
  page?: number
  limit?: number
  search?: string
  verified?: PhotoVerifiedFilter
}

export async function fetchPhotos(
  input: ListPhotosInput,
): Promise<ListPhotosResponse> {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.limit) params.set("limit", String(input.limit))
  if (input.search?.trim()) params.set("search", input.search.trim())
  if (input.verified) params.set("verified", input.verified)

  const qs = params.toString()
  const res = await apiFetch(`/api/v1/photos/admin${qs ? `?${qs}` : ""}`)

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load photos"))
  }

  const body = (await res.json()) as Envelope<ListPhotosResponse>
  if (!body?.data) {
    throw new Error("Invalid photos response returned from API")
  }
  return body.data
}

export async function setPhotoVerified(photoId: string, isVerified: boolean) {
  const res = await apiFetch(`/api/v1/photos/admin/${photoId}/verify`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isVerified }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update photo"))
  }
  return (await res.json()) as Envelope<{ id: string; isVerified: boolean }>
}

export async function verifyPhotos(ids: string[], isVerified = true) {
  const res = await apiFetch(`/api/v1/photos/admin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, isVerified }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to verify photos"))
  }
  return (await res.json()) as Envelope<{ count: number; isVerified: boolean }>
}

export async function setPhotoActive(photoId: string, isActive: boolean) {
  const res = await apiFetch(`/api/v1/photos/admin/${photoId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update photo"))
  }
  return (await res.json()) as Envelope<{ id: string; isActive: boolean }>
}

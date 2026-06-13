import { apiFetch, parseApiError } from "@/lib/api"

export type AdminPhotoRow = {
  id: string
  url: string
  isPrimary: boolean
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
}

export async function fetchPhotos(
  input: ListPhotosInput,
): Promise<ListPhotosResponse> {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.limit) params.set("limit", String(input.limit))
  if (input.search?.trim()) params.set("search", input.search.trim())

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

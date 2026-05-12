import { apiFetch, parseApiError } from "@/lib/api"

export type AdminGender = "MALE" | "FEMALE" | "OTHER"

export type AdminUserRow = {
  id: string
  email: string
  phone: string | null
  role: "admin" | "user" | null
  isActive: boolean
  createdAt: string
  name: string | null
  gender: AdminGender | null
}

export type ListUsersResponse = {
  data: AdminUserRow[]
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

export type ListUsersInput = {
  page?: number
  limit?: number
  search?: string
  gender?: AdminGender
}

export async function fetchUsers(input: ListUsersInput): Promise<ListUsersResponse> {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.limit) params.set("limit", String(input.limit))
  if (input.search?.trim()) params.set("search", input.search.trim())
  if (input.gender) params.set("gender", input.gender)

  const qs = params.toString()
  const res = await apiFetch(`/api/v1/users${qs ? `?${qs}` : ""}`)

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load users"))
  }

  const body = (await res.json()) as Envelope<ListUsersResponse>
  if (!body?.data) {
    throw new Error("Invalid users response returned from API")
  }
  return body.data
}

export async function setUserActive(userId: string, isActive: boolean) {
  const res = await apiFetch(`/api/v1/users/${userId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update user"))
  }

  const body = (await res.json()) as Envelope<{ id: string; isActive: boolean }>
  if (!body?.data) {
    throw new Error("Invalid update response returned from API")
  }
  return body.data
}

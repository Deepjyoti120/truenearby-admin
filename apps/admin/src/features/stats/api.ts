import { apiFetch, parseApiError } from "@/lib/api"

export type AdminUserStats = {
  total: number
  active: number
  inactive: number
  gender: {
    male: number
    female: number
    other: number
  }
  signups: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  generatedAt: string
}

type Envelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

export async function fetchUserStats(): Promise<AdminUserStats> {
  const res = await apiFetch("/api/v1/users/stats")

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load statistics"))
  }

  const body = (await res.json()) as Envelope<AdminUserStats>
  if (!body?.data) {
    throw new Error("Invalid statistics response returned from API")
  }
  return body.data
}

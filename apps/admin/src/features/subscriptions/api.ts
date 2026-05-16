import { apiFetch, parseApiError } from "@/lib/api"

export const PLAN_TIERS = ["FREE", "PLUS", "GOLD"] as const
export type PlanTier = (typeof PLAN_TIERS)[number]

export const FREE_PLAN_ID = "00000000-0000-0000-0000-000000000001"

export type SubscriptionFeatures = {
  canReverseLastSwipe: boolean
  canChangeSwipeDecision: boolean
  canSeeWhoLikedYou: boolean
  showLikesInAdvancedHome: boolean
  dailySwipeLimit: number
  dailySuperLikes: number
  monthlyBoosts: number
  canUnblurLikes: boolean
  canPassport: boolean
  hideAds: boolean
}

export type AdminSubscriptionPlanRow = {
  planId: string
  plan: PlanTier
  name: string
  description: string | null
  durationDays: number
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  features: SubscriptionFeatures
}

export type ListPlansResponse = {
  data: AdminSubscriptionPlanRow[]
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

export type ListPlansInput = {
  page?: number
  limit?: number
  search?: string
  code?: PlanTier
  isActive?: boolean
}

export type CreatePlanInput = {
  code: PlanTier
  name: string
  description?: string | null
  durationDays: number
  isActive?: boolean
  sortOrder?: number
} & Partial<SubscriptionFeatures>

export type UpdatePlanInput = Partial<Omit<CreatePlanInput, "code">>

export async function fetchPlans(
  input: ListPlansInput,
): Promise<ListPlansResponse> {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.limit) params.set("limit", String(input.limit))
  if (input.search?.trim()) params.set("search", input.search.trim())
  if (input.code) params.set("code", input.code)
  if (typeof input.isActive === "boolean")
    params.set("isActive", String(input.isActive))

  const qs = params.toString()
  const res = await apiFetch(
    `/api/v1/subscriptions/plans${qs ? `?${qs}` : ""}`,
  )

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load subscription plans"))
  }

  const body = (await res.json()) as Envelope<ListPlansResponse>
  if (!body?.data) {
    throw new Error("Invalid subscription plans response returned from API")
  }
  return body.data
}

export async function createPlan(input: CreatePlanInput) {
  const res = await apiFetch(`/api/v1/subscriptions/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to create subscription plan"))
  }

  const body = (await res.json()) as Envelope<AdminSubscriptionPlanRow>
  if (!body?.data) {
    throw new Error("Invalid create response returned from API")
  }
  return body.data
}

export async function updatePlan(planId: string, input: UpdatePlanInput) {
  const res = await apiFetch(`/api/v1/subscriptions/plans/${planId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update subscription plan"))
  }

  const body = (await res.json()) as Envelope<AdminSubscriptionPlanRow>
  if (!body?.data) {
    throw new Error("Invalid update response returned from API")
  }
  return body.data
}

export async function setPlanActive(planId: string, isActive: boolean) {
  const res = await apiFetch(`/api/v1/subscriptions/plans/${planId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update subscription plan"))
  }

  const body = (await res.json()) as Envelope<AdminSubscriptionPlanRow>
  if (!body?.data) {
    throw new Error("Invalid update response returned from API")
  }
  return body.data
}

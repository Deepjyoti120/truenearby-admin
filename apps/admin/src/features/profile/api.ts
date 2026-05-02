import { apiFetch, parseApiError } from "@/lib/api"

export type ProfileApiUserSummary = {
  id: string
  email: string
  role: string | null
  isActive: boolean
  photos: Array<{
    id: string
    url: string
    fileId: string
    isPrimary: boolean
    createdAt: string
  }>
}

export type ProfileApiRecord = {
  id: string
  userId: string
  name: string | null
  userName: string | null
  gender: string
  bio: string | null
  birthDate: string
  heightCm: number | null
  lookingFor: string
  interests: string[]
  latitude: number
  longitude: number
  city: string | null
  country: string | null
  isHidden: boolean
  isRegistered: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
  matchPreference: {
    id: string
    profileId: string
    minAge: number
    maxAge: number
    createdAt: string
    updatedAt: string
  } | null
  user: ProfileApiUserSummary
}

export type UserProfileModel = {
  success: boolean
  account: {
    id: string
    email: string
    role: string | null
    isActive: boolean
    profileName: string
    photos: ProfileApiUserSummary["photos"]
  }
  profile: ProfileApiRecord | null
  activeSubscription: unknown
}

export type UserProfileApiResponse = {
  success: boolean
  message: string
  data: UserProfileModel
}

export type UpdateProfileSettingsInput = {
  profileName?: string
  currentPassword?: string
  newPassword?: string
}

function formatRoleLabel(role: string | null) {
  if (!role) {
    return "No role"
  }

  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function getProfileDisplayModel(data: UserProfileModel) {
  const displayName = data.account.profileName || data.profile?.name || "Admin Profile"

  return {
    email: data.account.email,
    isActive: data.account.isActive,
    name: displayName,
    profileName: displayName,
    role: data.account.role,
    roleLabel: formatRoleLabel(data.account.role),
  }
}

export async function fetchProfile() {
  const res = await apiFetch("/api/v1/profile")

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load profile"))
  }

  const body = (await res.json()) as UserProfileApiResponse

  if (!body?.data) {
    throw new Error("Invalid profile response returned from API")
  }

  return body.data
}

export async function updateProfileSettings(input: UpdateProfileSettingsInput) {
  const res = await apiFetch("/api/v1/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update settings"))
  }

  const body = (await res.json()) as { message?: string }

  return {
    message:
      typeof body?.message === "string"
        ? body.message
        : "Settings updated successfully",
  }
}

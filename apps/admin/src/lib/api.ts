export const API_URL = "http://localhost:3001"

export type CurrentAdminUser = {
  id: string
  email: string
  role: string | null
  profileName: string
}

export type AdminProfileState = {
  account: CurrentAdminUser & {
    isActive: boolean
    roleLabel: string
  }
  profile: {
    id?: string
    profileName: string
  } | null
}

async function parseApiError(res: Response, fallbackMessage: string) {
  let message = fallbackMessage

  try {
    const body = await res.json()
    if (typeof body?.message === "string") {
      message = body.message
    } else if (Array.isArray(body?.message) && typeof body.message[0] === "string") {
      message = body.message[0]
    }
  } catch {
    // ignore JSON parse errors
  }

  return message
}

function normalizeCurrentAdminUser(payload: unknown): CurrentAdminUser {
  const source =
    payload && typeof payload === "object" && "user" in payload
      ? (payload as { user?: unknown }).user
      : payload

  if (!source || typeof source !== "object") {
    throw new Error("Invalid user payload returned from settings API")
  }

  const user = source as Record<string, unknown>

  return {
    id: typeof user.id === "string" ? user.id : "",
    email: typeof user.email === "string" ? user.email : "",
    role: typeof user.role === "string" || user.role === null ? (user.role as string | null) : null,
    profileName:
      typeof user.profileName === "string"
        ? user.profileName
        : typeof user.name === "string"
          ? user.name
          : "",
  }
}

function formatRoleLabel(role: string | null) {
  if (!role) {
    return "No role"
  }

  return role.charAt(0).toUpperCase() + role.slice(1)
}

function normalizeProfileState(payload: unknown): AdminProfileState {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid profile payload returned from API")
  }

  const body = payload as {
    account?: Record<string, unknown>
    profile?: Record<string, unknown> | null
  }

  const accountSource =
    body.account && typeof body.account === "object"
      ? body.account
      : {}

  const baseAccount = normalizeCurrentAdminUser(accountSource)
  const profileSource =
    body.profile && typeof body.profile === "object" ? body.profile : null

  return {
    account: {
      ...baseAccount,
      isActive:
        typeof accountSource.isActive === "boolean" ? accountSource.isActive : true,
      roleLabel: formatRoleLabel(baseAccount.role),
    },
    profile: profileSource
      ? {
          id: typeof profileSource.id === "string" ? profileSource.id : undefined,
          profileName:
            typeof profileSource.name === "string"
              ? profileSource.name
              : baseAccount.profileName,
        }
      : null,
  }
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Invalid credentials"))
  }

  return res.json()
}

export async function apiLogout() {
  await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}

export async function apiGetCurrentUser() {
  const res = await fetch(`${API_URL}/api/v1/users/me`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load settings"))
  }

  return normalizeCurrentAdminUser(await res.json())
}

export async function apiGetProfileState() {
  const res = await fetch(`${API_URL}/api/v1/profile`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load profile"))
  }

  return normalizeProfileState(await res.json())
}

export async function apiUpdateProfileSettings(input: {
  profileName?: string
  currentPassword?: string
  newPassword?: string
}) {
  const res = await fetch(`${API_URL}/api/v1/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update settings"))
  }

  const body = (await res.json()) as { message?: string }

  return {
    message: typeof body?.message === "string" ? body.message : "Settings updated successfully",
  }
}

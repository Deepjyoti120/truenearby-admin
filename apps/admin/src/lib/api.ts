// export const API_URL = "https://deepjyoti-next-admin-api.vercel.app"
export const API_URL = "https://api.truenearby.com"
// export const API_URL = "http://localhost:3001"

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"

export const tokenStore = {
  getAccess(): string {
    if (typeof window === "undefined") return ""
    return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? ""
  },
  getRefresh(): string {
    if (typeof window === "undefined") return ""
    return window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? ""
  },
  set(accessToken: string, refreshToken?: string | null) {
    if (typeof window === "undefined") return
    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    }
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },
  clear() {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

export async function parseApiError(res: Response, fallbackMessage: string) {
  let message = fallbackMessage

  try {
    const body = await res.json()
    if (typeof body?.message === "string" && body.message !== "Success") {
      message = body.message
    } else if (Array.isArray(body?.message) && typeof body.message[0] === "string") {
      message = body.message[0]
    }
  } catch {
    // ignore JSON parse errors
  }

  return message
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

let refreshInFlight: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  const storedRefresh = tokenStore.getRefresh()
  if (!storedRefresh) return null

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    })

    if (!res.ok) return null

    const body = (await res.json()) as ApiEnvelope<{
      accessToken?: string
      refreshToken?: string
    }>
    if (!body?.success || !body.data?.accessToken) return null

    tokenStore.set(body.data.accessToken, body.data.refreshToken ?? null)
    return body.data.accessToken
  } catch {
    return null
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      return await performRefresh()
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

function redirectToLogin() {
  if (typeof window === "undefined") return
  if (window.location.pathname.startsWith("/login")) return
  window.location.replace("/login")
}

function isAuthRoute(path: string) {
  const url = path.startsWith("http") ? new URL(path).pathname : path
  return url.includes("/auth/")
}

type ApiFetchOptions = RequestInit & {
  retryOnUnauthorized?: boolean
  authenticated?: boolean
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { retryOnUnauthorized = true, authenticated = true, headers, ...init } = options
  const url = path.startsWith("http") ? path : `${API_URL}${path}`

  const buildHeaders = (token: string | null): HeadersInit => {
    const h = new Headers(headers)
    h.set("Accept", "application/json")
    if (authenticated && token) {
      h.set("Authorization", `Bearer ${token}`)
    }
    return h
  }

  const initialToken = authenticated ? tokenStore.getAccess() : null
  const res = await fetch(url, { ...init, headers: buildHeaders(initialToken) })

  if (
    res.status !== 401 ||
    !retryOnUnauthorized ||
    !authenticated ||
    isAuthRoute(url)
  ) {
    return res
  }

  const newAccessToken = await refreshAccessToken()
  if (!newAccessToken) {
    tokenStore.clear()
    redirectToLogin()
    return res
  }

  return fetch(url, { ...init, headers: buildHeaders(newAccessToken) })
}

function getPlatform() {
  return "web"
}

export async function apiLogin(email: string, password: string) {
  const res = await apiFetch("/api/v1/auth/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, platform: getPlatform() }),
    authenticated: false,
    retryOnUnauthorized: false,
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Invalid credentials"))
  }

  const body = (await res.json()) as ApiEnvelope<{
    accessToken: string
    refreshToken?: string
    user?: unknown
  }>

  if (!body?.data?.accessToken) {
    throw new Error("Login response missing access token")
  }

  tokenStore.set(body.data.accessToken, body.data.refreshToken ?? null)

  return body.data
}

export async function apiLogout() {
  const refreshToken = tokenStore.getRefresh()

  try {
    await apiFetch("/api/v1/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      retryOnUnauthorized: false,
    })
  } finally {
    tokenStore.clear()
  }
}

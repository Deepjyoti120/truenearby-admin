export const API_URL = "http://localhost:3001"

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

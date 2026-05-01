export const API_URL = "http://localhost:3001"

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    let message = "Invalid credentials"
    try {
      const body = await res.json()
      if (typeof body?.message === "string") message = body.message
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  return res.json()
}

export async function apiLogout() {
  await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}

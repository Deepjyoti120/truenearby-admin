export const API_URL = "http://localhost:3001"

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error("Invalid credentials")
  }

  return res.json()
}
export async function apiLogout() {
  await fetch("http://localhost:3001/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}


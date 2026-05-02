"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { tokenStore } from "@/lib/api"

type AuthGuardProps = {
  mode: "protected" | "guest"
  children: React.ReactNode
}

export function AuthGuard({ mode, children }: AuthGuardProps) {
  const router = useRouter()
  const hasToken = Boolean(tokenStore.getAccess())
  const shouldRedirect =
    (mode === "protected" && !hasToken) || (mode === "guest" && hasToken)

  useEffect(() => {
    if (mode === "protected" && !hasToken) {
      router.replace("/login")
      return
    }

    if (mode === "guest" && hasToken) {
      router.replace("/dashboard")
    }
  }, [hasToken, mode, router])

  if (shouldRedirect) return null

  return <>{children}</>
}

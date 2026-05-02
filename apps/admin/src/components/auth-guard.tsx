"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { tokenStore } from "@/lib/api"

type AuthGuardProps = {
  mode: "protected" | "guest"
  children: React.ReactNode
}

export function AuthGuard({ mode, children }: AuthGuardProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hasToken = Boolean(tokenStore.getAccess())

    if (mode === "protected" && !hasToken) {
      router.replace("/login")
      return
    }

    if (mode === "guest" && hasToken) {
      router.replace("/dashboard")
      return
    }

    setReady(true)
  }, [mode, router])

  if (!ready) return null

  return <>{children}</>
}

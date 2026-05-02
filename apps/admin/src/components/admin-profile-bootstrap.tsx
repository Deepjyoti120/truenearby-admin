"use client"

import { useEffect } from "react"

import { ensureAdminProfileLoaded } from "@/stores/admin-profile-store"

export function AdminProfileBootstrap() {
  useEffect(() => {
    void ensureAdminProfileLoaded()
  }, [])

  return null
}

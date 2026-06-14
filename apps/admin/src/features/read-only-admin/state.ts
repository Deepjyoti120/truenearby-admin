"use client"

import { useAdminProfileQuery } from "@/features/profile/query"

export const RESTRICTED_EDIT_EMAIL = "admin@gmail.com"

export function useIsEditAccess(): boolean {
  const { data } = useAdminProfileQuery()
  const email = data?.account.email
  // Default to "restricted" while the profile is still loading so a quick
  // click on Create/Edit during initial mount cannot bypass the check.
  if (!email) return true
  return email.toLowerCase() === RESTRICTED_EDIT_EMAIL.toLowerCase()
}

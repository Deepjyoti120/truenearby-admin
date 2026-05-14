"use client"

import { useAdminProfileQuery } from "@/features/profile/query"

export const RESTRICTED_EDIT_EMAIL = "deepjyosssti120281@gmail.com"

export function useIsEditAccess(): boolean {
  const { data } = useAdminProfileQuery()
  const email = data?.account.email
  if (!email) return false
  return email.toLowerCase() === RESTRICTED_EDIT_EMAIL.toLowerCase()
}

"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchProfile } from "@/features/profile/api"

export const adminProfileQueryKey = ["admin-profile"] as const

export function useAdminProfileQuery() {
  return useQuery({
    queryKey: adminProfileQueryKey,
    queryFn: fetchProfile,
  })
}

"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchUserStats } from "@/features/stats/api"

export const userStatsQueryKey = ["admin-user-stats"] as const

export function useUserStatsQuery() {
  return useQuery({
    queryKey: userStatsQueryKey,
    queryFn: fetchUserStats,
    staleTime: 60_000,
  })
}

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchSettings,
  updateCurrency,
  type SupportedCurrency,
} from "@/features/settings/api"

export const appSettingsQueryKey = ["app-settings"] as const

export function useAppSettingsQuery() {
  return useQuery({
    queryKey: appSettingsQueryKey,
    queryFn: fetchSettings,
    staleTime: 60_000,
  })
}

export function useUpdateCurrencyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (currency: SupportedCurrency) => updateCurrency(currency),
    onSuccess: (data) => {
      queryClient.setQueryData(appSettingsQueryKey, data)
    },
  })
}

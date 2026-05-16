"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchSettings,
  updateSettings,
  type UpdateSettingsInput,
} from "@/features/settings/api"

export const appSettingsQueryKey = ["app-settings"] as const

export function useAppSettingsQuery() {
  return useQuery({
    queryKey: appSettingsQueryKey,
    queryFn: fetchSettings,
    staleTime: 60_000,
  })
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => updateSettings(input),
    onSuccess: (data) => {
      queryClient.setQueryData(appSettingsQueryKey, data)
    },
  })
}

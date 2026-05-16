"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createPlan,
  fetchPlans,
  setPlanActive,
  updatePlan,
  type CreatePlanInput,
  type ListPlansInput,
  type ListPlansResponse,
  type UpdatePlanInput,
} from "@/features/subscriptions/api"

export const plansQueryKey = (input: ListPlansInput) =>
  [
    "admin-subscription-plans",
    input.page ?? 1,
    input.limit ?? 10,
    input.search ?? "",
    input.code ?? "",
    typeof input.isActive === "boolean" ? input.isActive : "",
  ] as const

export function usePlansQuery(input: ListPlansInput) {
  return useQuery({
    queryKey: plansQueryKey(input),
    queryFn: () => fetchPlans(input),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useCreatePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePlanInput) => createPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] })
    },
  })
}

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlanInput }) =>
      updatePlan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] })
    },
  })
}

export function useSetPlanActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setPlanActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-subscription-plans"],
      })
      const snapshots: Array<{
        key: readonly unknown[]
        data: ListPlansResponse | undefined
      }> = []

      queryClient
        .getQueriesData<ListPlansResponse>({
          queryKey: ["admin-subscription-plans"],
        })
        .forEach(([key, data]) => {
          snapshots.push({ key, data })
          if (!data) return
          queryClient.setQueryData<ListPlansResponse>(key, {
            ...data,
            data: data.data.map((row) =>
              row.planId === id ? { ...row, isActive } : row,
            ),
          })
        })

      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(({ key, data }) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-subscription-plans"],
      })
    },
  })
}

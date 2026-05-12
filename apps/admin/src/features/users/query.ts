"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchUsers,
  setUserActive,
  type ListUsersInput,
  type ListUsersResponse,
} from "@/features/users/api"

export const usersQueryKey = (input: ListUsersInput) =>
  [
    "admin-users",
    input.page ?? 1,
    input.limit ?? 10,
    input.search ?? "",
    input.gender ?? "",
  ] as const

export function useUsersQuery(input: ListUsersInput) {
  return useQuery({
    queryKey: usersQueryKey(input),
    queryFn: () => fetchUsers(input),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useSetUserActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setUserActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] })
      const snapshots: Array<{
        key: readonly unknown[]
        data: ListUsersResponse | undefined
      }> = []

      queryClient
        .getQueriesData<ListUsersResponse>({ queryKey: ["admin-users"] })
        .forEach(([key, data]) => {
          snapshots.push({ key, data })
          if (!data) return
          queryClient.setQueryData<ListUsersResponse>(key, {
            ...data,
            data: data.data.map((row) =>
              row.id === id ? { ...row, isActive } : row,
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

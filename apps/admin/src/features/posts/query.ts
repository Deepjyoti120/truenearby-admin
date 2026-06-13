"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchPosts,
  setPostActive,
  setPostVerified,
  verifyPosts,
  type ListPostsInput,
} from "@/features/posts/api"
import { setUserActive } from "@/features/users/api"

export const postsQueryKey = (input: ListPostsInput) =>
  [
    "admin-posts",
    input.page ?? 1,
    input.limit ?? 20,
    input.search ?? "",
    input.verified ?? "unverified",
  ] as const

export function usePostsQuery(input: ListPostsInput) {
  return useQuery({
    queryKey: postsQueryKey(input),
    queryFn: () => fetchPosts(input),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useSetPostVerifiedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      setPostVerified(id, isVerified),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}

export function useVerifyPostsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, isVerified = true }: { ids: string[]; isVerified?: boolean }) =>
      verifyPosts(ids, isVerified),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}

export function useSetPostActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setPostActive(id, isActive),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
    },
  })
}

export function useSetPostOwnerActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setUserActive(id, isActive),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

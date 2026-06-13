"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchPhotos,
  setPhotoActive,
  setPhotoVerified,
  verifyPhotos,
  type ListPhotosInput,
} from "@/features/photos/api"

export const photosQueryKey = (input: ListPhotosInput) =>
  [
    "admin-photos",
    input.page ?? 1,
    input.limit ?? 20,
    input.search ?? "",
    input.verified ?? "unverified",
  ] as const

export function usePhotosQuery(input: ListPhotosInput) {
  return useQuery({
    queryKey: photosQueryKey(input),
    queryFn: () => fetchPhotos(input),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useSetPhotoVerifiedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      setPhotoVerified(id, isVerified),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photos"] })
    },
  })
}

export function useVerifyPhotosMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, isVerified = true }: { ids: string[]; isVerified?: boolean }) =>
      verifyPhotos(ids, isVerified),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photos"] })
    },
  })
}

export function useSetPhotoActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setPhotoActive(id, isActive),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photos"] })
    },
  })
}

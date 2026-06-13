"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchPhotos, type ListPhotosInput } from "@/features/photos/api"

export const photosQueryKey = (input: ListPhotosInput) =>
  [
    "admin-photos",
    input.page ?? 1,
    input.limit ?? 20,
    input.search ?? "",
  ] as const

export function usePhotosQuery(input: ListPhotosInput) {
  return useQuery({
    queryKey: photosQueryKey(input),
    queryFn: () => fetchPhotos(input),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

"use client"

import { useSyncExternalStore } from "react"

import { apiGetProfileState, type AdminProfileState } from "@/lib/api"

type AdminProfileStoreState = {
  error: string
  isInitialized: boolean
  isLoading: boolean
  profileState: AdminProfileState | null
}

const listeners = new Set<() => void>()

let state: AdminProfileStoreState = {
  error: "",
  isInitialized: false,
  isLoading: false,
  profileState: null,
}

let inflightRequest: Promise<AdminProfileState> | null = null

function emitChange() {
  listeners.forEach((listener) => listener())
}

function setState(
  nextState:
    | Partial<AdminProfileStoreState>
    | ((currentState: AdminProfileStoreState) => Partial<AdminProfileStoreState>)
) {
  const partialState =
    typeof nextState === "function" ? nextState(state) : nextState

  state = {
    ...state,
    ...partialState,
  }

  emitChange()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

async function runProfileRequest() {
  const profileState = await apiGetProfileState()

  setState({
    error: "",
    isInitialized: true,
    isLoading: false,
    profileState,
  })

  return profileState
}

export function ensureAdminProfileLoaded() {
  if (state.isInitialized && state.profileState) {
    return Promise.resolve(state.profileState)
  }

  if (inflightRequest) {
    return inflightRequest
  }

  setState((currentState) => ({
    error: "",
    isLoading: currentState.profileState === null,
  }))

  inflightRequest = runProfileRequest()
    .catch((error) => {
      setState({
        error: error instanceof Error ? error.message : "Failed to load profile",
        isInitialized: true,
        isLoading: false,
      })

      throw error
    })
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

export function refreshAdminProfile() {
  if (inflightRequest) {
    return inflightRequest
  }

  setState({
    error: "",
    isLoading: true,
  })

  inflightRequest = runProfileRequest()
    .catch((error) => {
      setState({
        error: error instanceof Error ? error.message : "Failed to refresh profile",
        isLoading: false,
      })

      throw error
    })
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

export function useAdminProfileStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

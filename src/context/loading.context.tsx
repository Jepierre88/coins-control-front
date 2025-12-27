"use client"

import * as React from "react"

type LoadingState = Record<string, boolean>

interface LoadingContextValue {
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  setLoading: (key: string, loading: boolean) => void
  clearLoading: (key: string) => void
  clearAll: () => void
}

const LoadingContext = React.createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingState, setLoadingState] = React.useState<LoadingState>({})

  const isLoading = React.useCallback((key: string) => {
    return loadingState[key] ?? false
  }, [loadingState])

  const isAnyLoading = React.useCallback(() => {
    return Object.values(loadingState).some(value => value === true)
  }, [loadingState])

  const setLoading = React.useCallback((key: string, loading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: loading,
    }))
  }, [])

  const clearLoading = React.useCallback((key: string) => {
    setLoadingState(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }, [])

  const clearAll = React.useCallback(() => {
    setLoadingState({})
  }, [])

  const value = React.useMemo(
    () => ({
      isLoading,
      isAnyLoading,
      setLoading,
      clearLoading,
      clearAll,
    }),
    [isLoading, isAnyLoading, setLoading, clearLoading, clearAll]
  )

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = React.useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider")
  }
  return context
}

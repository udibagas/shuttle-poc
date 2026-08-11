import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../lib/api'
import type { User, LoginRequest } from '@shuttle/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = apiClient.getToken()
    if (token) {
      apiClient
        .get<User>('/auth/me')
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          apiClient.setToken(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await apiClient.post<{ token: string; user: User }>(
      '/auth/login',
      credentials
    )
    apiClient.setToken(response.token)
    setUser(response.user)
  }

  const logout = () => {
    apiClient.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

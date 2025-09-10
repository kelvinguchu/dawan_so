'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getCurrentUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  authenticateUser,
  forgotPasswordUser,
  resetPasswordUser,
  resendVerificationUser,
} from '@/lib/auth'
import type { User } from '@/payload-types'
import type {
  RegisterData,
  RegisterResult,
  ForgotPasswordResult,
  ResetPasswordResult,
  ResetPasswordData,
  ResendVerificationResult,
} from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  logout: () => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
  register: (data: RegisterData) => Promise<RegisterResult>
  login: (email: string, password: string) => Promise<boolean>
  forgotPassword: (email: string) => Promise<ForgotPasswordResult>
  resetPassword: (data: ResetPasswordData) => Promise<ResetPasswordResult>
  resendVerification: (email: string) => Promise<ResendVerificationResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const { user: currentUser } = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { user: refreshedUser } = await refreshUserSession()
      setUser(refreshedUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const result = await logoutUser()
      if (result.success) {
        setUser(null)
      }
      return result
    } catch (error) {
      console.error('Error logging out:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<RegisterResult> => {
    try {
      const result = await registerUser(data)
      if (result.success && result.user) {
        // Don't automatically set the user - let them login after registration
        // This follows Payload's best practice for email verification
      }
      return result
    } catch (error) {
      console.error('Error registering user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null)
      setIsLoading(true)

      const result = await authenticateUser(email, password)

      if (result.success && result.user) {
        setUser(result.user)
        return true
      } else {
        setError(result.error || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Error logging in:', error)
      setError(error instanceof Error ? error.message : 'Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const forgotPassword = useCallback(async (email: string): Promise<ForgotPasswordResult> => {
    try {
      setError(null)
      const result = await forgotPasswordUser(email)

      if (!result.success && result.error) {
        setError(result.error)
      }

      return result
    } catch (error) {
      console.error('Error requesting password reset:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }, [])

  const resetPassword = useCallback(
    async (data: ResetPasswordData): Promise<ResetPasswordResult> => {
      try {
        setError(null)
        setIsLoading(true)

        const result = await resetPasswordUser(data)

        if (result.success && result.user) {
          setUser(result.user)
        } else if (result.error) {
          setError(result.error)
        }

        return result
      } catch (error) {
        console.error('Error resetting password:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to reset password'
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const resendVerification = useCallback(
    async (email: string): Promise<ResendVerificationResult> => {
      try {
        setError(null)
        const result = await resendVerificationUser(email)

        if (!result.success && result.error) {
          setError(result.error)
        }

        return result
      } catch (error) {
        console.error('Error resending verification:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to resend verification email'
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      }
    },
    [],
  )

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
    refreshUser,
    register,
    login,
    forgotPassword,
    resetPassword,
    resendVerification,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

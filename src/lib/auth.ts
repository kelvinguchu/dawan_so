'use server'

import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { login as payloadLogin, logout as payloadLogout } from '@payloadcms/next/auth'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import type { SanitizedPermissions } from 'payload'
import {
  generateVerificationEmailHTML,
  generateVerificationEmailSubject,
} from '@/templates/verification-email'

const VERIFICATION_EMAIL_LIMIT = 5
const VERIFICATION_EMAIL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const VERIFICATION_EMAIL_LOG_LIMIT = 10

type ResendVerificationUser = {
  id: string
  email: string
  name?: string | null
  _verified?: boolean | null
  isEmailVerified?: boolean | null
  verificationEmailRequests?:
    | {
        sentAt: string
        context?: string | null
        id?: string | null
      }[]
    | null
}

export interface AuthResult {
  user: User | null
  permissions?: SanitizedPermissions
}

export interface LoginResult {
  success: boolean
  user?: User
  token?: string
  exp?: number
  error?: string
}

export interface PayloadLoginResult {
  user: User
  token: string
  exp: number
}

export interface RegisterResult {
  success: boolean
  user?: User
  error?: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordResult {
  success: boolean
  message?: string
  error?: string
}

export interface ResetPasswordResult {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface ResendVerificationResult {
  success: boolean
  message?: string
  error?: string
  code?: 'rate_limit' | 'already_verified' | 'not_found' | 'invalid_request' | 'unknown'
}

export interface VerifyEmailResult {
  success: boolean
  message?: string
  error?: string
}

export interface UpdateUserResult {
  success: boolean
  user?: User
  error?: string
}

export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user, permissions } = await payload.auth({ headers })

    return {
      user: user as User | null,
      permissions,
    }
  } catch (error) {
    console.error('Error fetching current user:', error)
    return { user: null }
  }
}

export async function authenticateUser(email: string, password: string): Promise<LoginResult> {
  try {
    const result = (await payloadLogin({
      collection: 'users',
      config,
      email,
      password,
    })) as PayloadLoginResult

    return {
      success: true,
      user: result.user,
      token: result.token,
      exp: result.exp,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

export async function registerUser(data: RegisterData): Promise<RegisterResult> {
  try {
    const payload = await getPayload({ config })

    const user = (await payload.create({
      collection: 'users',
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        roles: ['user'],
      },
    })) as User

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error) {
      if (error.message.includes('email')) {
        return {
          success: false,
          error: 'An account with this email already exists.',
        }
      }
      if (error.message.includes('validation')) {
        return {
          success: false,
          error: 'Please check your information and try again.',
        }
      }
    }

    return {
      success: false,
      error: 'Registration failed. Please try again.',
    }
  }
}

export async function forgotPasswordUser(email: string): Promise<ForgotPasswordResult> {
  try {
    const payload = await getPayload({ config })

    await payload.forgotPassword({
      collection: 'users',
      data: {
        email: email.trim().toLowerCase(),
      },
      disableEmail: false,
    })

    return {
      success: true,
      message: 'Password reset instructions have been sent to your email address.',
    }
  } catch (error) {
    console.error('Forgot password error:', error)

    if (error instanceof Error) {
      if (error.message.includes('No user found')) {
        return {
          success: false,
          error: 'No account found with this email address.',
        }
      }
      if (error.message.includes('email')) {
        return {
          success: false,
          error: 'Please provide a valid email address.',
        }
      }
    }

    return {
      success: false,
      error: 'Failed to send reset email. Please try again.',
    }
  }
}

export async function resetPasswordUser(data: ResetPasswordData): Promise<ResetPasswordResult> {
  try {
    const payload = await getPayload({ config })

    const result = await payload.resetPassword({
      collection: 'users',
      data: {
        token: data.token,
        password: data.password,
      },
      overrideAccess: true,
    })

    return {
      success: true,
      user: result.user as unknown as User,
      token: result.token,
    }
  } catch (error) {
    console.error('Reset password error:', error)

    if (error instanceof Error) {
      if (error.message.includes('token')) {
        return {
          success: false,
          error: 'Invalid or expired reset token. Please request a new password reset.',
        }
      }
      if (error.message.includes('password')) {
        return {
          success: false,
          error: 'Password does not meet requirements. Please try a different password.',
        }
      }
    }

    return {
      success: false,
      error: 'Failed to reset password. Please try again.',
    }
  }
}

export async function resendVerificationUser(
  email: string,
  options: { context?: string } = {},
): Promise<ResendVerificationResult> {
  try {
    const payload = await getPayload({ config })

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      return {
        success: false,
        code: 'invalid_request',
        error: 'Fadlan geli ciwaan email sax ah.',
      }
    }

    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
      limit: 1,
    })

    if (!users.docs.length) {
      return {
        success: false,
        code: 'not_found',
        error: 'Haddii xisaab jirto, waxaan mar kale dirnay emaylka xaqiijinta.',
      }
    }

    const user = users.docs[0] as ResendVerificationUser

    if (user._verified || user.isEmailVerified) {
      return {
        success: false,
        code: 'already_verified',
        error: 'Ciwaankan email-ka hore ayaa loo xaqiijiyay.',
      }
    }

    const now = new Date()
    const windowStart = new Date(now.getTime() - VERIFICATION_EMAIL_WINDOW_MS)

    const existingLog = Array.isArray(user.verificationEmailRequests)
      ? user.verificationEmailRequests
      : []

    const recentRequests = existingLog
      .map((entry) => {
        if (!entry?.sentAt) return null

        const parsed = new Date(entry.sentAt)
        if (Number.isNaN(parsed.getTime()) || parsed < windowStart) {
          return null
        }

        return {
          sentAt: parsed,
          context: entry.context ?? null,
        }
      })
      .filter((entry): entry is { sentAt: Date; context: string | null } => entry !== null)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())

    if (recentRequests.length >= VERIFICATION_EMAIL_LIMIT) {
      return {
        success: false,
        code: 'rate_limit',
        error:
          'Waxaad gaadhay xadka codsiyada toddobaadlaha ah ee emayllada xaqiijinta. Fadlan isku day mar dambe.',
      }
    }

    const crypto = await import('node:crypto')
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const updatedLog = [
      ...recentRequests.map((entry) => ({
        sentAt: entry.sentAt.toISOString(),
        context: entry.context ?? null,
      })),
      {
        sentAt: now.toISOString(),
        context: options.context ?? 'self-service',
      },
    ].slice(-VERIFICATION_EMAIL_LOG_LIMIT)

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        _verificationToken: verificationToken,
        verificationEmailRequests: updatedLog,
      },
      overrideAccess: true,
    })

    const emailPayload = {
      email: user.email,
      name: user.name ?? undefined,
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    await payload.sendEmail({
      to: normalizedEmail,
      subject: generateVerificationEmailSubject({ user: emailPayload }),
      html: generateVerificationEmailHTML({ token: verificationToken, user: emailPayload }),
      text: `Ku dhameystir isdiiwaangelintaada adigoo booqanaya: ${verificationUrl}`,
    })

    return {
      success: true,
      message: 'Emaylka xaqiijinta waa la diray. Fadlan hubi sanduuqaaga.',
    }
  } catch (error) {
    console.error('Resend verification error:', error)

    if (error instanceof Error) {
      if (error.message.includes('email')) {
        return {
          success: false,
          code: 'invalid_request',
          error: 'Fadlan geli ciwaan email sax ah.',
        }
      }
    }

    return {
      success: false,
      code: 'unknown',
      error: 'Dib u dirista email-ka xaqiijinta waa ay fashilantay. Fadlan mar kale isku day.',
    }
  }
}

export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    await payloadLogout({ config })
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    }
  }
}

export async function refreshUserSession(): Promise<AuthResult> {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user, permissions } = await payload.auth({ headers })

    return {
      user: user as User | null,
      permissions,
    }
  } catch (error) {
    console.error('Error refreshing user session:', error)
    return { user: null }
  }
}

export async function requireAuth(): Promise<User> {
  const { user } = await getCurrentUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

export async function checkUserPermissions(
  collection?: string,
): Promise<SanitizedPermissions | Record<string, unknown> | boolean> {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const authResult = await payload.auth({ headers })
    const permissions = authResult.permissions as SanitizedPermissions | boolean | undefined

    if (permissions === true) {
      return true
    }

    if (collection && permissions && typeof permissions === 'object') {
      const collectionPermissions = (permissions as Record<string, unknown>)[collection]
      return collectionPermissions || {}
    }

    return permissions || {}
  } catch (error) {
    console.error('Error checking permissions:', error)
    return {}
  }
}

export async function verifyUserEmail(token: string): Promise<VerifyEmailResult> {
  try {
    const payload = await getPayload({ config })
    const normalizedToken = token?.trim()

    if (!normalizedToken) {
      return {
        success: false,
        error: 'Xiriirinta xaqiijintu waa khalad. Calaamad lama bixin.',
      }
    }

    type UserWithHiddenFields = {
      id: string
      isEmailVerified?: boolean | null
      _verificationToken?: string | null
    }

    let matchedUser: UserWithHiddenFields | undefined

    try {
      const lookup = await payload.find({
        collection: 'users',
        where: {
          _verificationToken: {
            equals: normalizedToken,
          },
        },
        limit: 1,
        showHiddenFields: true,
        overrideAccess: true,
      })

      matchedUser = (lookup.docs[0] as UserWithHiddenFields | undefined) ?? undefined
    } catch (lookupError) {
      payload.logger?.warn?.(
        {
          err: lookupError,
        },
        'Failed to locate user by verification token before verifying email.',
      )
    }

    const result = await payload.verifyEmail({
      collection: 'users',
      token: normalizedToken,
    })

    if (result) {
      if (matchedUser?.id) {
        try {
          await payload.update({
            collection: 'users',
            id: matchedUser.id,
            data: {
              isEmailVerified: true,
            },
            overrideAccess: true,
          })
        } catch (syncError) {
          payload.logger?.warn?.(
            {
              err: syncError,
              userId: matchedUser.id,
            },
            'Email verified but failed to update isEmailVerified flag.',
          )
        }
      }

      return {
        success: true,
        message: 'Your email has been successfully verified!',
      }
    } else {
      return {
        success: false,
        error: 'Email verification failed. The token may be invalid or expired.',
      }
    }
  } catch (error) {
    console.error('Email verification error:', error)

    if (error instanceof Error) {
      if (error.message.includes('token')) {
        return {
          success: false,
          error: 'Invalid or expired verification token. Please request a new verification email.',
        }
      }
      if (error.message.includes('already verified')) {
        return {
          success: false,
          error: 'This email address is already verified.',
        }
      }
    }

    return {
      success: false,
      error: 'An error occurred while verifying your email. Please try again.',
    }
  }
}

export async function getUserWithDetails(depth: number = 2): Promise<User | null> {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) return null

    const detailedUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth,
    })

    return detailedUser as User
  } catch (error) {
    console.error('Error fetching detailed user:', error)
    return null
  }
}

export async function updateUserName(name: string): Promise<UpdateUserResult> {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: { name },
    })

    return { success: true, user: updatedUser as User }
  } catch (error) {
    console.error('Error updating user name:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update name',
    }
  }
}

export async function updateUserProfilePicture(mediaId: string): Promise<UpdateUserResult> {
  try {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: { profilePicture: mediaId },
    })

    return { success: true, user: updatedUser as User }
  } catch (error) {
    console.error('Error updating profile picture:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile picture',
    }
  }
}

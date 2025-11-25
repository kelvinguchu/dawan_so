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
  generateVerificationEmailText,
} from '@/templates/verification-email'

const VERIFICATION_EMAIL_LIMIT = 5
const VERIFICATION_EMAIL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const VERIFICATION_EMAIL_LOG_LIMIT = 10

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>
type UserWithVerificationMeta = User & { _verificationToken?: string | null }

async function findUserByVerificationToken(
  payloadClient: PayloadInstance,
  token: string,
): Promise<UserWithVerificationMeta | undefined> {
  try {
    const lookup = await payloadClient.find({
      collection: 'users',
      where: {
        _verificationToken: {
          equals: token,
        },
      },
      limit: 1,
      showHiddenFields: true,
      overrideAccess: true,
    })

    return (lookup.docs[0] as UserWithVerificationMeta | undefined) ?? undefined
  } catch (error) {
    payloadClient.logger?.warn?.(
      {
        err: error,
      },
      'Failed to locate user by verification token before verifying email.',
    )
    return undefined
  }
}

async function syncVerifiedFlag(payloadClient: PayloadInstance, userId: string): Promise<void> {
  try {
    await payloadClient.update({
      collection: 'users',
      id: userId,
      data: {
        isEmailVerified: true,
      },
      overrideAccess: true,
    })
  } catch (error) {
    payloadClient.logger?.warn?.(
      {
        err: error,
        userId,
      },
      'Email verified but failed to update isEmailVerified flag.',
    )
  }
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

    if (user) {
      const freshUser = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 1,
      })
      return {
        user: freshUser,
        permissions,
      }
    }

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

    const createdUser = (await payload.create({
      collection: 'users',
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        roles: ['user'],
      },
    })) as unknown as User

    return {
      success: true,
      user: createdUser,
    }
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error) {
      const normalizedMessage = error.message.toLowerCase()

      if (
        normalizedMessage.includes('already exists') ||
        normalizedMessage.includes('duplicate') ||
        normalizedMessage.includes('unique')
      ) {
        return {
          success: false,
          error: 'An account with this email already exists.',
        }
      }
      if (normalizedMessage.includes('validation')) {
        return {
          success: false,
          error: 'Please check your information and try again.',
        }
      }
      if (normalizedMessage.includes('email')) {
        return {
          success: false,
          error: 'We could not send the verification email. Please try again in a moment.',
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

export async function resendVerificationUser(email: string): Promise<ResendVerificationResult> {
  try {
    const payload = await getPayload({ config })

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      return {
        success: false,
        code: 'invalid_request',
        error: 'Fadlan geli cinwaan email oo sax ah.',
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
      showHiddenFields: true,
    })

    if (!users.docs.length) {
      return {
        success: false,
        code: 'not_found',
        error: 'Haddii akoon jiro, waxaan dirnay emaylka xaqiijinta.',
      }
    }

    const user = users.docs[0] as User & {
      verificationEmailRequests?:
        | {
            id?: string
            sentAt?: string
            context?: string | null
          }[]
        | null
      _verificationToken?: string | null
    }

    if (user._verified || user.isEmailVerified) {
      return {
        success: false,
        code: 'already_verified',
        error: 'Cinwaankan email hore ayaa loo xaqiijiyay.',
      }
    }

    const now = new Date()
    const windowStart = new Date(now.getTime() - VERIFICATION_EMAIL_WINDOW_MS)

    const existingLog = Array.isArray(user.verificationEmailRequests)
      ? user.verificationEmailRequests
      : []

    const recentRequests = existingLog
      .filter((entry): entry is { sentAt: string; context?: string | null; id?: string } => {
        if (!entry?.sentAt) return false
        const parsed = new Date(entry.sentAt)
        return !Number.isNaN(parsed.getTime()) && parsed >= windowStart
      })
      .map((entry) => ({
        sentAt: new Date(entry.sentAt),
        context: entry.context ?? null,
      }))
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())

    if (recentRequests.length >= VERIFICATION_EMAIL_LIMIT) {
      return {
        success: false,
        code: 'rate_limit',
        error:
          'Waxaad gaartay xadka todobaadlaha ee emayllada xaqiijinta. Fadlan mar dambe isku day.',
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
        context: 'self-service',
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

    await payload.sendEmail({
      to: normalizedEmail,
      subject: generateVerificationEmailSubject({ user: emailPayload }),
      html: generateVerificationEmailHTML({ token: verificationToken, user: emailPayload }),
      text: generateVerificationEmailText({ token: verificationToken, user: emailPayload }),
    })

    return {
      success: true,
      message: 'Emaylka xaqiijinta waa la diray. Fadlan ka hubi sanduuqa ama spam.',
    }
  } catch (error) {
    console.error('Resend verification error:', error)

    if (error instanceof Error) {
      if (error.message.includes('email')) {
        return {
          success: false,
          code: 'invalid_request',
          error: 'Fadlan geli cinwaan email oo sax ah.',
        }
      }
    }

    return {
      success: false,
      code: 'unknown',
      error: 'Emaylka xaqiijinta dib looma diri karin. Fadlan mar kale isku day.',
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
    const payloadClient = await getPayload({ config })
    const normalizedToken = token?.trim()

    if (!normalizedToken) {
      return {
        success: false,
        error: 'Xiriirka xaqiijinta ma shaqaynayo. Calaamad lama helin.',
      }
    }

    const matchedUser = await findUserByVerificationToken(payloadClient, normalizedToken)
    const verificationSucceeded = await payloadClient.verifyEmail({
      collection: 'users',
      token: normalizedToken,
    })

    if (!verificationSucceeded) {
      return {
        success: false,
        error: 'Email verification failed. The token may be invalid or expired.',
      }
    }

    if (matchedUser?.id) {
      await syncVerifiedFlag(payloadClient, matchedUser.id)
    }

    return {
      success: true,
      message: 'Your email has been successfully verified!',
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

    const detailedUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
      depth,
    })) as unknown as User

    return detailedUser
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

    const updatedUser = (await payload.update({
      collection: 'users',
      id: user.id,
      data: { name },
    })) as unknown as User

    return { success: true, user: updatedUser }
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

    const updatedUser = (await payload.update({
      collection: 'users',
      id: user.id,
      data: { profilePicture: mediaId },
    })) as unknown as User

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating profile picture:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile picture',
    }
  }
}

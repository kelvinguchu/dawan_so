import type { PayloadRequest } from 'payload'

export const generateForgotPasswordEmailHTML = (args?: {
  req?: PayloadRequest
  token?: string
  user?: {
    email: string
    name?: string
  }
}): string => {
  const { token, user } = args || {}

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'
  const safeToken = encodeURIComponent(token || '')
  const resetPasswordURL = `${baseUrl}/reset-password?token=${safeToken}`
  const safeUserEmail = escapeHtml(user?.email || 'Unknown User')
  const safeUserName = escapeHtml(user?.name || 'User')

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Dawan TV</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${baseUrl}/logo.png" alt="Dawan TV" style="max-width: 200px; height: auto;">
    </div>
    
    <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #b01c14; text-align: center; margin-bottom: 24px; font-size: 28px;">Reset Your Password</h1>
      
      <p style="font-size: 16px; margin-bottom: 20px;">Hello ${safeUserName},</p>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        We received a request to reset the password for your Dawan TV account (${safeUserEmail}). 
        If you made this request, click the button below to set a new password.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetPasswordURL}" 
           style="background-color: #b01c14; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Reset Password
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #b01c14; word-break: break-all; margin-bottom: 24px;">
        ${resetPasswordURL}
      </p>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 24px 0;">
        <p style="font-size: 14px; color: #92400e; margin: 0; font-weight: bold;">
          ⚠️ Security Notice
        </p>
        <p style="font-size: 14px; color: #92400e; margin: 8px 0 0 0;">
          This password reset link will expire in 1 hour for your security. 
          If you didn't request this reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
        <h3 style="color: #b01c14; margin-bottom: 16px;">Need Help?</h3>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you're having trouble accessing your account or didn't request this password reset, 
          please contact our support team. We're here to help keep your account secure.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #999; margin: 0;">
          © 2024 Dawan TV. All rights reserved.<br>
          Your trusted source for African news and insights.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export const generateForgotPasswordEmailSubject = (_args?: {
  req?: PayloadRequest
  user?: {
    email: string
    name?: string
  }
}): string => {
  return 'Reset Your Password - Dawan TV'
}

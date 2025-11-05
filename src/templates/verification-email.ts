import type { PayloadRequest } from 'payload'

export const generateVerificationEmailHTML = (args?: {
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
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'
  const safeToken = encodeURIComponent(token || '')
  const verifyEmailURL = `${baseUrl}/verify-email?token=${safeToken}`
  const safeUserEmail = escapeHtml(user?.email || 'Unknown User')
  const safeUserName = escapeHtml(user?.name || 'User')

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Dawan TV</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${baseUrl}/logo.png" alt="Dawan TV" style="max-width: 200px; height: auto;">
    </div>
    
    <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #b01c14; text-align: center; margin-bottom: 24px; font-size: 28px;">Welcome to Dawan TV!</h1>
      
      <p style="font-size: 16px; margin-bottom: 20px;">Hello ${safeUserName},</p>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Thank you for joining Dawan TV with your email address ${safeUserEmail}.
        To complete your registration and start exploring our content, please verify your email address.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyEmailURL}" 
           style="background-color: #b01c14; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Verify Email Address
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #b01c14; word-break: break-all; margin-bottom: 24px;">
        ${verifyEmailURL}
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
        <h3 style="color: #b01c14; margin-bottom: 16px;">What's Next?</h3>
        <ul style="color: #666; font-size: 14px; line-height: 1.6;">
          <li>📰 Access breaking news from across Africa</li>
          <li>🌍 Explore stories from all African countries</li>
          <li>💬 Join discussions with our community</li>
          <li>📧 Get personalized news updates</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 32px; text-align: center;">
        If you didn't create an account with us, please ignore this email.
      </p>
      
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

export const generateVerificationEmailSubject = (_args?: {
  req?: PayloadRequest
  user?: {
    email: string
    name?: string
  }
}): string => {
  return 'Welcome to Dawan TV - Please Verify Your Email'
}

export const generateVerificationEmailText = (args?: {
  token?: string
  user?: {
    email: string
    name?: string
  }
}): string => {
  const { token, user } = args || {}

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'
  const verifyEmailURL = `${baseUrl}/verify-email?token=${encodeURIComponent(token || '')}`

  const name = user?.name ? `Hello ${user.name},` : 'Hello,'

  return `${name}

Thank you for joining Dawan TV. Please verify your email address to activate your account by visiting the link below:

${verifyEmailURL}

If you did not create this account, you can safely ignore this message.

— The Dawan TV Team`
}

import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://dawan.so'
const SECRET = process.env.UNSUBSCRIBE_TOKEN_SECRET

if (!SECRET) {
  throw new Error(
    'UNSUBSCRIBE_TOKEN_SECRET environment variable is required. ' +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  )
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function generateSecureToken(email: string): string {
  const normalizedEmail = normalizeEmail(email)
  const timestamp = Date.now().toString()
  const payload = `${normalizedEmail}:${timestamp}`
  const hmac = crypto.createHmac('sha256', SECRET!)
  hmac.update(payload)
  const signature = hmac.digest('hex')

  // Include email in the token itself for security
  const tokenData = `${normalizedEmail}:${timestamp}:${signature}`
  return Buffer.from(tokenData).toString('base64url')
}

export function buildUnsubscribeUrl(email: string): string {
  const normalizedEmail = normalizeEmail(email)
  const token = generateSecureToken(normalizedEmail)

  const query = new URLSearchParams({
    token,
  })

  return `${BASE_URL}/api/newsletter/unsubscribe?${query.toString()}`
}

export function escapeUrlForHtml(url: string): string {
  return url.replace(/&/g, '&amp;')
}

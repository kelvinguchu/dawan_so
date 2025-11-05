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
  const safeUserEmail = escapeHtml(user?.email || 'Isticmaale aan la aqoon')
  const safeUserName = escapeHtml(user?.name || 'Saaxiib')
  const currentYear = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xaqiiji Emaylkaaga - Dawan TV</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${baseUrl}/logo.png" alt="Dawan TV" style="max-width: 200px; height: auto;">
    </div>
    
    <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #b01c14; text-align: center; margin-bottom: 24px; font-size: 28px;">Ku soo dhowow Dawan TV!</h1>

      <p style="font-size: 16px; margin-bottom: 20px;">Salaan ${safeUserName},</p>

      <p style="font-size: 16px; margin-bottom: 20px;">
        Waad ku mahadsan tahay isdiiwaangelinta Dawan TV adigoo adeegsanaya cinwaanka ${safeUserEmail}.
        Si aad u dhammaystirto isdiiwaangelinta oo aad u bilowdo inaad hesho wararkeenna, fadlan xaqiiji emaylkaaga hadda.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyEmailURL}" 
           style="background-color: #b01c14; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Xaqiiji Emaylka
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
        Haddii batoonka kore uusan shaqayn, nuqul oo dhaji xiriirka hoose ee biraawsarkaaga:
      </p>
      <p style="font-size: 14px; color: #b01c14; word-break: break-all; margin-bottom: 24px;">
        ${verifyEmailURL}
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
        <h3 style="color: #b01c14; margin-bottom: 16px;">Maxaa xiga?</h3>
        <ul style="color: #666; font-size: 14px; line-height: 1.6;">
          <li>📰 Akhri warar degdeg ah oo ka kala socda Soomaaliya iyo Afrika.</li>
          <li>🌍 Baro sheekooyin xiiso leh oo ka imanaya dalalka Afrika.</li>
          <li>💬 Ka qaybgal doodaha iyo falcelinta bulshada Dawan.</li>
          <li>📧 Hel warbixinno iyo digniino gaar ah oo kugu habboon.</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 32px; text-align: center;">
        Haddii aadan adigu samayn akoonkan, fadlan iska indha tir fariintan.
      </p>
      
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #999; margin: 0;">
          © ${currentYear} Dawan TV. Xuquuqaha oo dhan way xafidan yihiin.<br>
          Ilaha laga helo wararka iyo falanqaynta lagu kalsoon yahay ee Soomaaliya iyo Afrika.
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
  return 'Ku soo dhowow Dawan TV - Fadlan xaqiiji emaylkaaga'
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

  const name = user?.name ? `Salaan ${user.name},` : 'Salaan,'

  return `${name}

Waad ku mahadsan tahay inaad iska diiwaangeliso Dawan TV. Si aad u dhaqaajiso akoonkaaga fadlan xaqiiji emaylka adigoo booqanaya xiriirka hoose:

${verifyEmailURL}

Haddii aadan adigu samayn akoonkan, waad iska indha tiri kartaa fariintan.

— Kooxda Dawan TV`
}

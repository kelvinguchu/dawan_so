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
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'
  const safeToken = encodeURIComponent(token || '')
  const resetPasswordURL = `${baseUrl}/reset-password?token=${safeToken}`
  const safeUserEmail = escapeHtml(user?.email || 'Isticmaale aan la aqoon')
  const safeUserName = escapeHtml(user?.name || 'Saaxiib')
  const currentYear = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dib u deji erayga sirta ah - Dawan TV</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${baseUrl}/logo.png" alt="Dawan TV" style="max-width: 200px; height: auto;">
    </div>
    
    <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #b01c14; text-align: center; margin-bottom: 24px; font-size: 28px;">Dib u deji erayga sirta ah</h1>

      <p style="font-size: 16px; margin-bottom: 20px;">Salaan ${safeUserName},</p>

      <p style="font-size: 16px; margin-bottom: 20px;">
        Waxaan helnay codsi ah in erayga sirta ah ee akoonkaaga Dawan TV (${safeUserEmail}) la beddelo.
        Haddii adigu codsigan diray, guji batoonka hoose si aad u dejiso eray sir cusub.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetPasswordURL}" 
           style="background-color: #b01c14; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
          Dib u deji erayga sirta ah
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
        Haddii batoonka kore uusan shaqayn, nuqul oo dhaji xiriirka hoose ee biraawsarkaaga:
      </p>
      <p style="font-size: 14px; color: #b01c14; word-break: break-all; margin-bottom: 24px;">
        ${resetPasswordURL}
      </p>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 24px 0;">
        <p style="font-size: 14px; color: #92400e; margin: 0; font-weight: bold;">
          ⚠️ Ogeysiis Amni
        </p>
        <p style="font-size: 14px; color: #92400e; margin: 8px 0 0 0;">
          Xiriirkan dib u dejinta ayaa dhacaya 1 saac gudahood si loo ilaaliyo akoonkaaga.
          Haddii adigu aadan codsan dib u dejintan, iska indha tir fariintan, eraygaaga sirta ahna ma beddelmi doono.
        </p>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
        <h3 style="color: #b01c14; margin-bottom: 16px;">Ma u baahan tahay gargaar?</h3>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Haddii aad dhibaato kala kulanto gelitaanka akoonkaaga ama aadan codsan dib u dejintan,
          nala soo xidhiidh kooxda taageerada. Waxaan halkaan u joognaa inaan ka ilaalino akoonkaaga khataraha.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #999; margin: 0;">
          © ${currentYear} Dawan TV. Xuquuqaha oo dhan way xafidan yihiin.<br>
          Ilaha lagu kalsoonaan karo ee wararka iyo falanqaynta Afrika.
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
  return 'Dib u deji erayga sirta ah - Dawan TV'
}

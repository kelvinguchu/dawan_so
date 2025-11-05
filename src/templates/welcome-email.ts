import { buildUnsubscribeUrl, escapeUrlForHtml } from '@/utils/unsubscribe'

interface WelcomeEmailParams {
  firstName?: string
  email: string
}

interface WelcomeEmailContent {
  subject: string
  html: string
}

export function generateWelcomeEmail({
  firstName,
  email,
}: WelcomeEmailParams): WelcomeEmailContent {
  const subject = 'Ku soo dhowow wargeyska Dawan TV!'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'

  const unsubscribeUrl = buildUnsubscribeUrl(email)
  const currentYear = new Date().getFullYear()

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ku soo dhowow Dawan TV</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="${siteUrl}/logo.png" alt="Dawan TV" style="max-width: 200px; height: auto;">
    </div>
    
    <h1 style="color: #b01c14; text-align: center;">Ku soo dhowow wargeyska Dawan TV!</h1>

    ${firstName ? `<p>Gacaliye ${firstName},</p>` : '<p>Salaan,</p>'}

    <p>Waad ku mahadsan tahay inaad isku qortay wargeyska Dawan TV! Aad ayaan ugu faraxsanahay inaad ku soo biirtay bulshada akhristayaasheena ee doonaya warar sax ah oo waqtigooda ku habboon.</p>

    <p>Waxaad naga filan kartaa waxyaabaha soo socda:</p>
    <ul>
      <li>📰 Warar degdeg ah oo ka kala socda Soomaaliya iyo Afrika.</li>
      <li>💼 Aragtiyo ganacsi iyo dhaqaale.</li>
      <li>🏛️ Falanqayn siyaasadeed iyo dhacdooyin muhiim ah.</li>
      <li>🌍 Sheekooyin dhaqan iyo aragtiyo bulshada laga soo gudbiyo.</li>
      <li>🚀 Cusboonaysiin ku saabsan hal-abuurka iyo tiknoolajiyada.</li>
    </ul>
    
    <p>Waxaan si joogto ah kuu soo diri doonnaa warar iyo falanqayn si taxaddar leh loo doortay oo ku habboon danahaaga.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${siteUrl}" style="background-color: #b01c14; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Booqo boggayaga</a>
    </div>
    
    <p>Haddii aad qabtid su'aalo ama talooyin, si xor ah ugu jawaab fariintan. Aad ayaan u jeclaan lahayn inaan kaa maqalno!</p>

    <p>Mahadsanid,<br>Kooxda Dawan TV</p>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
      <p>
        Fariintan waxaad u heshay sababtoo ah waxaad iska diiwaangelisay wargeyskayaga.
        <br>
        <a href="${escapeUrlForHtml(unsubscribeUrl)}" style="color: #b01c14;">Ka bax wargeyska</a> | 
        <a href="${siteUrl}" style="color: #b01c14;">Booqo boggayaga</a>
      </p>
      <p>
        © ${currentYear} Dawan TV<br>
        Marinio Rd, Muqdisho, Soomaaliya
      </p>
    </div>
  </body>
</html>
  `.trim()

  return {
    subject,
    html,
  }
}

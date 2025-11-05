'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { MailCheck, RefreshCw, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

interface PendingVerificationClientProps {
  initialEmail?: string
}

export const PendingVerificationClient: React.FC<PendingVerificationClientProps> = ({
  initialEmail = '',
}) => {
  const { resendVerification } = useAuth()
  const [email, setEmail] = useState(initialEmail)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [isResending, setIsResending] = useState(false)

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])

  const handleResend = async () => {
    if (!normalizedEmail) {
      setFeedback({
        type: 'error',
        message: 'Fadlan geli ciwaanka email-ka ee aad isdiiwaangelinta ku isticmaashay.',
      })
      return
    }

    setIsResending(true)
    setFeedback(null)

    try {
      const result = await resendVerification(normalizedEmail)

      if (result.success) {
        setFeedback({
          type: 'success',
          message:
            result.message ||
            'Email-kii xaqiijinta waa la diray. Fadlan hubi sanduuqaaga iyo spam-ka.',
        })
      } else {
        setFeedback({
          type: 'error',
          message:
            result.error ||
            'Dib u dirista email-ka xaqiijinta way fashilantay. Fadlan mar kale isku day.',
        })
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      setFeedback({
        type: 'error',
        message: 'Khalad lama filaan ah ayaa dhacay. Fadlan mar kale isku day.',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-lg w-full">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center">
          <MailCheck className="h-12 w-12 text-[#b01c14]" />
        </div>
        <CardTitle className="text-2xl font-semibold text-slate-900">Hubi email-kaaga</CardTitle>
        <CardDescription className="text-slate-600">
          Waxaan dirnay xiriirinta xaqiijinta ee{' '}
          <span className="font-medium text-slate-900">{normalizedEmail || 'email-kaaga'}</span>.
          Fadlan xaqiiji si aad u hawlgeliso akoonkaaga.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-600">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-[#b01c14] mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-slate-700">Ka hor intaadan sii wadin:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Fur email-ka xaqiijinta oo guji xiriirinta si aad u hawlgeliso akoonkaaga.</li>
                <li>
                  Ma aragtay email-ka? Hubi spam ama qeybta xayeysiisyada ka hor intaadan helin
                  xiriir cusub.
                </li>
                <li>
                  Xiriirinta ayaa dhacayso muddo kooban ka dib, marka fadlan dhaqso u xaqiiji.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resend-email" className="text-sm font-medium text-slate-700">
            Cinwaanka email-ka
          </Label>
          <Input
            id="resend-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="magac@example.com"
            className="bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80 text-sm"
          />
          <Button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="mt-2 w-full bg-[#b01c14] hover:bg-[#b01c14]/80 text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isResending ? 'Diraya...' : 'Dib u dir email-ka xaqiijinta'}
          </Button>

          {feedback && (
            <div
              className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                feedback.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-slate-600 space-y-2">
          <p>Markaad xaqiijiso, waxaad sii wadan kartaa soo gelitaanka.</p>
          <Link
            href="/login"
            className="inline-flex items-center text-[#b01c14] hover:text-[#b01c14]/80"
          >
            Tag bogga soo gelidda
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

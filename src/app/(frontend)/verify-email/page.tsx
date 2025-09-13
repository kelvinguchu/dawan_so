import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { verifyUserEmail } from '@/lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Verification | Dawan TV',
  description: 'Verify your email address to complete your account setup.',
  robots: 'noindex, nofollow',
}

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams
  const token = params.token

  let status: 'success' | 'error' = 'error'
  let message = ''

  if (!token) {
    status = 'error'
    message = 'Xiriirinta xaqiijintu waa khalad. Calaamad lama bixin.'
  } else {
    const result = await verifyUserEmail(token)
    status = result.success ? 'success' : 'error'
    message = result.success ? result.message! : result.error!
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pt-16 sm:pt-24">
      <div className="flex-grow flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-slate-200 shadow-sm">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              {status === 'success' && <CheckCircle className="h-12 w-12 text-green-600" />}
              {status === 'error' && <AlertCircle className="h-12 w-12 text-red-600" />}
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              {status === 'success' && 'Iimaylka waa la xaqiijiyay!'}
              {status === 'error' && 'Xaqiijintu way guuldarreysatay'}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {status === 'success' && 'Iimaylkaaga si guul leh ayaa loo xaqiijiyay.'}
              {status === 'error' && 'Dhibaato ayaa ka dhacday xaqiijinta iimaylkaaga.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div
              className={`p-4 rounded-md text-sm ${
                status === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>

            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-[#b01c14] hover:bg-[#b01c14]/80 text-white">
                  Tag Bogga Hore
                </Button>
              </Link>

              {status === 'success' && (
                <Link href="/account" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Tag Akoonkayga
                  </Button>
                </Link>
              )}

              {status === 'error' && (
                <Link href="/register" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Ku noqo Isdiiwaangelinta
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

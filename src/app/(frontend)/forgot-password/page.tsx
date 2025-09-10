'use client'

import React, { useState, FormEvent } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ErrorMessage {
  type: 'success' | 'error'
  text: string
}

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<ErrorMessage | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await forgotPassword(email.trim())

      if (result.success) {
        setMessage({
          type: 'success',
          text:
            result.message ||
            'Tilmaamaha dib‑u‑dejinta erayga sirta ayaa laguu soo diray iimaylkaaga.',
        })
        setEmail('')
      } else {
        setMessage({
          type: 'error',
          text:
            result.error || 'Dirista iimaylka dib‑u‑dejinta waa ku guuldareysatay. Fadlan isku day mar kale.',
        })
      }
    } catch (error: unknown) {
      console.error('Forgot password error:', error)

      let errorMessage = 'Khalad lama filaan ah ayaa dhacay. Fadlan mar dambe isku day.'

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (!navigator.onLine) {
        errorMessage = 'Internet ma jiro. Fadlan hubi shabakadda oo mar kale isku day.'
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-white space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-900 text-center">
              Ilowday Erayga Sirta?
            </CardTitle>
            <CardDescription className="text-slate-500 text-center">
              Geli ciwaanka iimaylkaaga, waxaan kuu soo diri doonaa tilmaamaha dib‑u‑dejinta
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-white pt-2 pb-8 px-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email-address" className="text-sm font-medium text-slate-700">
                  Ciwaanka Iimaylka
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/10 text-sm"
                    placeholder="magac@tusaale.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {message && (
                <Alert
                  className={`${
                    message.type === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}
                  >
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#b01c14] hover:bg-[#238da1] shadow-sm transition-colors text-sm"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Diraya tilmaamaha...
                    </>
                  ) : (
                    'Dir Tilmaamaha Dib‑u‑Dejinta'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-slate-500">
                Ma xasuusataa erayga sirta?{' '}
                <Link href="/login" className="font-medium text-[#b01c14] hover:text-[#238da1]">
                  Soo gal halkan
                </Link>
              </p>

              <Link
                href="/"
                className="inline-flex items-center text-sm text-slate-500 hover:text-[#b01c14] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Ku noqo Bogga Hore
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Sababo amni awgood, xiriiriyeyaasha dib‑u‑dejintu waxay dhacaan 1 saac kadib. Haddii aadan helin iimayl, fadlan hubi spam‑ka.
          </p>
        </div>
      </div>
    </div>
  )
}

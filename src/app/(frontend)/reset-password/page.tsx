'use client'

import React, { useState, FormEvent, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KeyRound, ArrowLeft, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Calaamadda dib‑u‑dejintu waa khalad ama way maqan tahay. Fadlan codso dib‑u‑dejinta erayga sirta cusub.',
      })
    }
  }, [token])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Erayga sirta waa inuu ka koobnaadaa ugu yaraan 8 xaraf'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Erayga sirta waa inuu lahaadaa ugu yaraan hal xaraf oo yaryar'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Erayga sirta waa inuu lahaadaa ugu yaraan hal xaraf oo waaweyn'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Erayga sirta waa inuu lahaadaa ugu yaraan hal tiro'
    }
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      setMessage({
        type: 'error',
        text: 'Calaamad dib‑u‑dejinta khaldan. Fadlan codso dib‑u‑dejinta eray sir cusub.',
      })
      return
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Erayada sirta isma waafaqaan.',
      })
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage({
        type: 'error',
        text: passwordError,
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await resetPassword({
        token,
        password,
      })

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Erayga sirta si guul leh ayaa dib‑loogu dejiyay. Waxaa lagu leexinayaa bogga gelitaanka...',
        })

        setPassword('')
        setConfirmPassword('')

        setTimeout(() => {
          router.push(
            '/login?message=Dib‑u‑dejinta erayga sirta waa guulaystay. Fadlan gal adigoo isticmaalaya eraygaaga sirta cusub.',
          )
        }, 3000)
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Dib‑u‑dejinta erayga sirta waa ku guuldareysatay. Fadlan isku day mar kale.',
        })
      }
    } catch (error: unknown) {
      console.error('Reset password error:', error)

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
              Dib‑u‑deji Erayga Sirta
            </CardTitle>
            <CardDescription className="text-slate-500 text-center">
              Geli erayga sirta cusub hoos
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-white pt-2 pb-8 px-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Erayga Sirta Cusub
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="pl-10 pr-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/10 text-sm"
                    placeholder="Geli eray sir cusub"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || !token}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Xaqiiji Erayga Sirta Cusub
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="pl-10 pr-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/10 text-sm"
                    placeholder="Xaqiiji eray sir cusub"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || !token}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-2">Shuruudaha Erayga Sirta:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`}
                    />
                    Ugu yaraan 8 xaraf
                  </li>
                  <li className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${/(?=.*[a-z])/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`}
                    />
                    Hal xaraf oo yaryar
                  </li>
                  <li className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${/(?=.*[A-Z])/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`}
                    />
                    Hal xaraf oo waaweyn
                  </li>
                  <li className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${/(?=.*\d)/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`}
                    />
                    Hal tiro
                  </li>
                </ul>
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
                  disabled={isLoading || !token || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Dib‑u‑dejinta Erayga Sirta...
                    </>
                  ) : (
                    'Dib‑u‑deji Erayga Sirta'
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
            Marka si guul leh loo dib‑u‑dejiyo erayga sirta, waxaa lagu leexin doonaa bogga gelitaanka.
          </p>
        </div>
      </div>
    </div>
  )
}

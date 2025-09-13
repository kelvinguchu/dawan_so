'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, KeyRound, Mail } from 'lucide-react'
import { toast } from 'sonner'

export const LoginForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, error, resendVerification } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isResending, setIsResending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const redirectTo = searchParams.get('redirect_to') ?? '/'
    const success = await login(email, password)

    if (success) {
      router.push(redirectTo)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Fadlan marka hore geli cinwaanka email-kaaga')
      return
    }

    setIsResending(true)
    try {
      const result = await resendVerification(email)

      if (result.success) {
        toast.success(result.message || 'Email-ka xaqiijinta waa la diray!')
      } else {
        toast.error(result.error || 'Dib u dirista email-ka xaqiijinta way fashilantay')
      }
    } catch (err) {
      console.error('Resend verification error:', err)
      toast.error('Khalad lama filaan ah ayaa dhacay. Fadlan mar kale isku day.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md w-full px-4 sm:px-0">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold text-slate-900 text-center">
            Soo gal
          </CardTitle>
          <CardDescription className="text-slate-500 text-center">
            Geli macluumaadkaaga si aad u gasho akoonkaaga
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-2 pb-8 px-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email-address" className="text-sm font-medium text-slate-700">
                Cinwaanka Email-ka
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80 text-sm"
                  placeholder="magac@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Erayga sirta ah
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#b01c14] hover:text-[#b01c14]/80"
                >
                  Ma illowday erayga sirta?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                {error}
                {error.includes('verify your email') && (
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-600">Ma helin email-ka?</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {isResending ? 'Diraya...' : 'Dib u dir email-ka'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#b01c14] hover:bg-[#b01c14]/80 shadow-sm transition-colors text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Galaya...' : 'Soo gal'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Ma lihid akoon?{' '}
              <Link href="/register" className="font-medium text-[#b01c14] hover:text-[#b01c14]/80">
                Abuuri akoon
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

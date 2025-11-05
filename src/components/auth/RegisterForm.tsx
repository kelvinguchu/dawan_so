'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Mail, KeyRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const RegisterForm: React.FC = () => {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(true)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Furayaasha sirta ahi isma waafaqaan.')
      return
    }

    setIsLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const result = await register({
        name,
        email: normalizedEmail,
        password,
      })

      if (result.success) {
        if (subscribeToNewsletter) {
          try {
            const extractFirstName = (fullName: string): string => {
              const trimmedName = fullName.trim()

              if (!trimmedName) {
                return 'Akhriste'
              }

              const nameParts = trimmedName.split(/\s+/).filter((part) => part.length > 0)
              return nameParts.length > 0 ? nameParts[0] : trimmedName
            }

            await fetch('/api/newsletter/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: normalizedEmail,
                firstName: extractFirstName(name),
                source: 'registration',
              }),
            })
          } catch (newsletterError) {
            console.error('Newsletter subscription error during registration:', newsletterError)
          }
        }

        router.push(`/verify-email/pending?email=${encodeURIComponent(normalizedEmail)}`)
      } else {
        setError(result.error || 'Diiwaangelintu way fashilantay. Fadlan mar kale isku day.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Khalad lama filaan ah ayaa dhacay. Fadlan mar kale isku day.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md w-full px-4 sm:px-0">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold text-slate-900 text-center">
            Abuuri Akoon
          </CardTitle>
          <CardDescription className="text-slate-500 text-center">
            Geli faahfaahintaada si aad u abuurto akoon cusub
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-2 pb-8 px-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Magaca oo Dhan
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="pl-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80 text-sm"
                  placeholder="Axmed Cali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email-address-register"
                className="text-sm font-medium text-slate-700"
              >
                Cinwaanka Email-ka
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email-address-register"
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
              <Label htmlFor="password-register" className="text-sm font-medium text-slate-700">
                Erayga sirta ah
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="password-register"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="pl-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                Xaqiiji Erayga sirta ah
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="pl-10 bg-white border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80 text-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 py-3">
              <Checkbox
                id="newsletter-subscribe"
                checked={subscribeToNewsletter}
                onCheckedChange={(checked) => setSubscribeToNewsletter(checked as boolean)}
                className="border-slate-300 data-[state=checked]:bg-[#b01c14] data-[state=checked]:border-[#b01c14]"
              />
              <Label
                htmlFor="newsletter-subscribe"
                className="text-sm text-slate-600 font-normal cursor-pointer leading-5"
              >
                Ku biir wargeyskayaga si aad ula socoto wararkii ugu dambeeyay ee Soomaaliya
              </Label>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{error}</div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#b01c14] hover:bg-[#b01c14]/80 shadow-sm transition-colors text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Abuuraya akoon...' : 'Abuuri akoon'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Hore ma u leedahay akoon?{' '}
              <Link href="/login" className="font-medium text-[#b01c14] hover:text-[#b01c14]/80">
                Soo gal
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

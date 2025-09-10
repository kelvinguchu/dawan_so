'use client'

import React, { useState, useEffect } from 'react'
import { User as PayloadUser } from '@/payload-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { BellIcon, LogOut } from 'lucide-react'
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager'
import { Skeleton } from '@/components/ui/skeleton'

interface UserSettingsProps {
  user: PayloadUser
}

export const UserSettings: React.FC<UserSettingsProps> = ({ user }) => {
  const [isEmailSubscribed, setIsEmailSubscribed] = useState<boolean | null>(null)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user.email) return
      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, source: 'settings-check' }),
        })

        if (!response.ok && response.status !== 409) {
          throw new Error('Lama hubin karo xaaladda rukumidda')
        }

        const data = await response.json()
        setIsEmailSubscribed(data.message?.includes('already subscribed'))
      } catch {
        setIsEmailSubscribed(false)
      }
    }

    checkSubscriptionStatus()
  }, [user.email])

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' })
      window.location.href = '/'
    } catch {
      toast.error('Khalad ayaa dhacay inta lagu jiray ka bixitaanka.')
    }
  }

  const handleEmailNotificationToggle = async (enabled: boolean) => {
    if (!user.email) {
      toast.error('Email-ka isticmaale lama helin.')
      return
    }

    setIsUpdatingEmail(true)
    const endpoint = enabled ? '/api/newsletter/subscribe' : '/api/newsletter/unsubscribe'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ma suurtagelin in rukumid la cusboonaysiiyo')
      }

      setIsEmailSubscribed(enabled)
      toast.success(`Ogeysiisyada wargeyska ${enabled ? 'waa la hawlgeliyay' : 'waa la demiyay'}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khalad aan la garanayn ayaa dhacay')
      setIsEmailSubscribed(!enabled)
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start">
            <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5 sm:mt-1 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
                Dejimaha Ogeysiisyada
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label
                    htmlFor="email-notifications"
                    className="text-xs sm:text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    Wargeyska Email-ka
                  </Label>
                  {isEmailSubscribed === null ? (
                    <Skeleton className="h-6 w-11 rounded-full" />
                  ) : (
                    <Switch
                      id="email-notifications"
                      checked={isEmailSubscribed}
                      onCheckedChange={handleEmailNotificationToggle}
                      disabled={isUpdatingEmail}
                    />
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Ogeysiisyada Riixitaanka
                  </Label>
                  <PushNotificationManager />
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <Button
                    variant="outline"
                    className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs sm:text-sm h-8 sm:h-9"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Ka Bax
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

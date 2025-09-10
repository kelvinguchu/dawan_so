'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)
    setSubscriptionMessage(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'footer',
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorMessage = 'Isdiiwaangelintu way fashilantay. Fadlan mar kale isku day.'

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch {}
        }

        setSubscriptionMessage({
          type: 'error',
          text: errorMessage,
        })
        return
      }

      const contentType = response.headers.get('content-type')

      if (!contentType || !contentType.includes('application/json')) {
        setSubscriptionMessage({
          type: 'success',
          text: 'Si guul ah ayaad ugu biirtay wargeyskayaga!'
        })
        setEmail('')
        return
      }

      const data = await response.json()

      const isAlreadySubscribed = data.message?.includes('already subscribed')

      setSubscriptionMessage({
        type: isAlreadySubscribed ? 'info' : 'success',
        text: isAlreadySubscribed ? data.message : 'Si guul ah ayaad ugu biirtay wargeyskayaga!',
      })

      if (!isAlreadySubscribed) {
        setEmail('')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setSubscriptionMessage({
        type: 'error',
        text: 'Khalad lama filaan ah ayaa dhacay. Fadlan mar dambe isku day.',
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="border-t border-slate-800 mt-6 sm:mt-10 pt-6 sm:pt-8">
      <div className="max-w-2xl mx-auto text-center">
        <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
          La Soco Wararkii Ugu Dambeeyay ee Soomaaliya
        </h4>
        <p className="text-slate-300 text-sm mb-6">
          Hel wararkii ugu dambeeyay iyo falanqayn toos loogu soo diro sanduuqaaga.
        </p>

        <form onSubmit={handleNewsletterSubmit} className="max-w-sm mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="Geli email-kaaga"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubscribing}
                className="h-10 pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-[#b01c14] focus:ring-[#b01c14]/20"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            <Button
              type="submit"
              disabled={isSubscribing || !email.trim()}
              className="h-10 px-6 bg-[#b01c14] hover:bg-[#1e90a6] text-white border-0"
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Isdiiwaangelinaya...
                </>
              ) : (
                'Isdiiwaangeli'
              )}
            </Button>
          </div>

          {subscriptionMessage && (
            <Alert
              className={`mt-4 ${
                subscriptionMessage.type === 'success'
                  ? 'border-green-500/20 bg-green-500/10 text-green-400'
                  : subscriptionMessage.type === 'error'
                    ? 'border-red-500/20 bg-red-500/10 text-red-400'
                    : 'border-blue-500/20 bg-blue-500/10 text-blue-400'
              }`}
            >
              {subscriptionMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : subscriptionMessage.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-blue-400" />
              )}
              <AlertDescription
                className={
                  subscriptionMessage.type === 'success'
                    ? 'text-green-400'
                    : subscriptionMessage.type === 'error'
                      ? 'text-red-400'
                      : 'text-blue-400'
                }
              >
                {subscriptionMessage.text}
              </AlertDescription>
            </Alert>
          )}
        </form>

        <p className="text-slate-400 text-xs mt-4">
          Ku biir bulshada akhristayaasha wargelinta leh. Waad ka bixi kartaa goor kasta.
        </p>
      </div>
    </div>
  )
}

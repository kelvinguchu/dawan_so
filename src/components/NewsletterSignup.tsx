'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface NewsletterResponse {
  message?: string
  error?: string
}

interface NewsletterSignupProps {
  className?: string
  title?: string
  description?: string
  showNameFields?: boolean
  source?: string
  onSuccess?: (data: NewsletterResponse) => void
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  className = '',
  title = 'Ku Biir Wargeyskayaga',
  description = 'Hel wararkii ugu dambeeyay iyo aragtiyo si toos ah looguugu soo diro sanduuqaaga.',
  showNameFields = true,
  source = 'website',
  onSuccess,
}) => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          source,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Isdiiwaangelintu way fashilantay. Fadlan mar kale isku day.'

        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } else {
            errorMessage = response.statusText || errorMessage
          }
        } catch {
          console.warn('Failed to parse error response as JSON')
        }

        setMessage({
          type: 'error',
          text: errorMessage,
        })
        return
      }

      let data: NewsletterResponse = {}

      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')

      if (response.status === 204 || response.status === 205 || contentLength === '0') {
        data = { message: 'Si guul leh ayaad ugu biirtay wargeyska!' }
      } else if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError)
          data = { message: 'Si guul leh ayaad ugu biirtay wargeyska!' }
        }
      } else {
        console.warn('Successful response is not JSON format')
        data = { message: 'Si guul leh ayaad ugu biirtay wargeyska!' }
      }

      const isAlreadySubscribed = data.message?.includes('already subscribed')

      setMessage({
        type: isAlreadySubscribed ? 'info' : 'success',
        text: data.message || 'Si guul leh ayaad ugu biirtay wargeyska!',
      })

      if (!isAlreadySubscribed) {
        setEmail('')
        setFirstName('')
        setLastName('')
      }

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setMessage({
        type: 'error',
        text: 'Khalad lama filaan ah ayaa dhacay. Fadlan mar dambe isku day.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`newsletter-signup ${className}`}>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {showNameFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Magaca Hore</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Axmed"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Magaca Dambe</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Cali"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Cinwaanka Email-ka *</Label>
            <Input
              id="email"
              type="email"
              placeholder="magac@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Isdiiwaangelinaya...
              </>
            ) : (
              'Isdiiwaangeli Wargeyska'
            )}
          </Button>
        </form>

        {message && (
          <Alert
            className={`${
              message.type === 'success'
                ? 'border-green-200 bg-green-50'
                : message.type === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle
                className={`h-4 w-4 ${message.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}
              />
            )}
            <AlertDescription
              className={`${
                message.type === 'success'
                  ? 'text-green-800'
                  : message.type === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
              }`}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Isdiiwaangeliddaada, waxaad ogolaatay inaad hesho emayllo suuq-geyn ah. Waad ka bixi kartaa wakhti kasta.
        </p>
      </div>
    </div>
  )
}

export default NewsletterSignup

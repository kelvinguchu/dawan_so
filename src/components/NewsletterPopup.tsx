'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface NewsletterPopupProps {
  delay?: number
}

export const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ delay = 5000 }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  useEffect(() => {
    let hasSeenPopup = false

    try {
      hasSeenPopup = localStorage.getItem('newsletter-popup-seen') === 'true'
    } catch (error) {
      console.warn('localStorage access failed:', error)
      hasSeenPopup = false
    }

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [delay])

  const handleClose = () => {
    setIsOpen(false)

    try {
      localStorage.setItem('newsletter-popup-seen', 'true')
    } catch (error) {
      console.warn('localStorage write failed:', error)
    }
  }

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
          source: 'popup',
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to subscribe. Please try again.'

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

      let data: { message?: string; error?: string } = {}

      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')

      if (response.status === 204 || response.status === 205 || contentLength === '0') {
        data = { message: 'Successfully subscribed!' }
      } else if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError)
          data = { message: 'Successfully subscribed!' }
        }
      } else {
        console.warn('Successful response is not JSON format')
        data = { message: 'Successfully subscribed!' }
      }

      const isAlreadySubscribed = data.message?.includes('already subscribed')

      setMessage({
        type: isAlreadySubscribed ? 'info' : 'success',
        text: isAlreadySubscribed
          ? data.message || 'You are already subscribed!'
          : data.message || 'Successfully subscribed! Welcome to our community.',
      })

      if (!isAlreadySubscribed) {
        setEmail('')
        setFirstName('')
      }

      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md z-1000 md:max-w-lg border-0 p-0 overflow-hidden w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-auto">
        <div className="relative bg-slate-900 p-6 sm:p-8 text-white">
          <div className="text-center pr-8">
            <div className="mb-2">
              <Image
                src="/logo.png"
                alt="Dawan TV"
                width={140}
                height={42}
                className="mx-auto"
                priority
              />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl hidden sm:text-3xl font-bold text-gray-900 leading-tight">
                Ha Seegin Sheeko
              </DialogTitle>
              <DialogDescription className="hidden text-base text-gray-600 mt-2">
                Ku biir wargeyskayaga si aad u hesho cusboonaysiino gaar ah, maqaallo qoto dheer,
                iyo wararkii ugu dambeeyay ee Soomaaliya — si toos ah looguugu soo diro sanduuqaaga.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="popup-firstName" className="text-sm font-medium text-slate-700">
                Magaca Hore
              </Label>
              <Input
                id="popup-firstName"
                type="text"
                placeholder="Magacaaga hore"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                className="h-11 border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="popup-email" className="text-sm font-medium text-slate-700">
                Cinwaanka Email-ka *
              </Label>
              <div className="relative">
                <Input
                  id="popup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 pl-11 border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/80"
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

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
                ) : message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-blue-600" />
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

            <div className="flex flex-col pt-3">
              <Button
                type="submit"
                className="w-full h-11 bg-[#b01c14] hover:bg-[#b01c14]/80 text-white font-medium"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Isdiiwaangelinaya...
                  </>
                ) : (
                  'Isdiiwaangeli Wargeyska'
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Ku biir kumannaan akhriste oo la soconaya wararka Soomaaliya. Waad ka bixi kartaa
              wakhti kasta.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NewsletterPopup

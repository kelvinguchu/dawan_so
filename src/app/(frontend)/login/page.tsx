'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle2 } from 'lucide-react'

function LoginClientBoundary() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = searchParams.get('redirect_to') ?? '/'
      router.replace(redirectTo)
    }
  }, [user, authLoading, router, searchParams])

  const registered = searchParams.get('registered')

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse text-slate-500 text-sm">Soo raraya...</div>
      </div>
    )
  }

  return (
    <>
      {registered && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-4 mb-6 max-w-md mx-auto rounded-md shadow-sm flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
          <p className="text-sm">Isdiiwaangelintu waa guulaysatay! Fadlan soo gal.</p>
        </div>
      )}
      <LoginForm />
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-12 pt-16 sm:pt-24">
      <Suspense
        fallback={
          <div className="flex items-center justify-center flex-grow">
            <div className="animate-pulse text-slate-500 text-sm">Soo raraya macluumaadka bogga...</div>
          </div>
        }
      >
        <LoginClientBoundary />
      </Suspense>
    </div>
  )
}

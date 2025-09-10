'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuth } from '@/contexts/AuthContext'

function RegisterClientBoundary() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = searchParams.get('redirect_to') || '/'
      router.replace(redirectTo)
    }
  }, [user, authLoading, router, searchParams])

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse text-slate-500 text-sm">Soo raraya...</div>
      </div>
    )
  }
  return <RegisterForm />
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-12 pt-16 sm:pt-24">
      <Suspense
        fallback={
          <div className="flex items-center justify-center flex-grow">
            <div className="animate-pulse text-slate-500 text-sm">Soo raraya macluumaadka bogga...</div>
          </div>
        }
      >
        <RegisterClientBoundary />
      </Suspense>
    </div>
  )
}

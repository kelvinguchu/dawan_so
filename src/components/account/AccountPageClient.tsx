'use client'

import React, { useCallback, useEffect, useState, Suspense, JSX } from 'react'
import { useRouter } from 'next/navigation'
import type { User as PayloadUser } from '@/payload-types'

import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { UserBio } from '@/components/account/UserBio'
import { UserProfile } from '@/components/account/UserProfile'
import { UserPosts } from '@/components/account/UserPosts'
import { UserSettings } from '@/components/account/UserSettings'
import { useAuth } from '@/contexts/AuthContext'
import { getUserWithDetails } from '@/lib/auth'

export default function AccountPageClient(): JSX.Element {
  const { user: authUser, isLoading: authLoading } = useAuth()
  const [detailedUser, setDetailedUser] = useState<PayloadUser | null>(null)
  const [isLoadingDetailed, setIsLoadingDetailed] = useState(false)
  const router = useRouter()

  const fetchDetailedUser = useCallback(async (): Promise<void> => {
    if (!authUser) return

    setIsLoadingDetailed(true)
    try {
      const user = await getUserWithDetails(2)
      setDetailedUser(user)
    } catch (err) {
      console.error('Failed to fetch detailed user', err)
      setDetailedUser(null)
    } finally {
      setIsLoadingDetailed(false)
    }
  }, [authUser])

  useEffect(() => {
    if (authUser && !authLoading) {
      fetchDetailedUser()
    }
  }, [authUser, authLoading, fetchDetailedUser])

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login?redirect=/account')
    }
  }, [authUser, authLoading, router])

  const handleUserUpdate = (updated: PayloadUser): void => {
    setDetailedUser(updated)
  }

  const tabFallback = (
    <div className="pt-4">
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  )

  if (authLoading || isLoadingDetailed || !detailedUser) {
    return (
      <div className="bg-white min-h-screen py-6">
        <div className="container mx-auto max-w-6xl px-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Skeleton className="h-64 rounded-md" />
            <Skeleton className="h-64 rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-slate-600 text-sm">Waxaa lagu leexinayaa gelitaanka...</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <UserBio user={detailedUser} onUpdate={handleUserUpdate} />

        {!detailedUser.isEmailVerified && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">Xaqiijinta Email-ka ayaa loo baahan yahay</h3>
                <p className="mt-1 text-sm text-amber-700">
                  Fadlan xaqiiji cinwaanka email-kaaga si aad u isticmaasho dhammaan adeegyada. Ka eeg sanduuqaaga (inbox) xiriirka xaqiijinta.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-white border border-slate-200 rounded-md p-1 mb-4 max-w-full overflow-x-auto md:overflow-visible">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 text-sm whitespace-nowrap"
              >
                Xogta
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 text-sm whitespace-nowrap"
              >
                Nuxurka
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 text-sm whitespace-nowrap"
              >
                Akoonka
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <Suspense fallback={tabFallback}>
                <UserProfile user={detailedUser} onUpdate={handleUserUpdate} />
              </Suspense>
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              <Suspense fallback={tabFallback}>
                <UserPosts user={detailedUser} />
              </Suspense>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Suspense fallback={tabFallback}>
                <UserSettings user={detailedUser} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

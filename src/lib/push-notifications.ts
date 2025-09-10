'use server'

import webpush from 'web-push'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { User } from 'payload'
import { getPostImageFromLayout } from '@/utils/postUtils'
import siteConfig from '@/app/shared-metadata'

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:info@dawan.so',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function subscribeUser(subscription: PushSubscriptionData) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return { success: false, error: 'Push notifications are not configured on the server' }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const user = (await payload.auth({ headers: new Headers() }))?.user as User | null
    const userId = user?.id ? String(user.id) : undefined

    const existingSubscription = await payload.find({
      collection: 'push-subscriptions',
      where: { endpoint: { equals: subscription.endpoint } },
      limit: 1,
    })

    if (existingSubscription.docs.length > 0) {
      await payload.update({
        collection: 'push-subscriptions',
        id: existingSubscription.docs[0].id,
        data: {
          keys: subscription.keys,
          user: userId,
        },
      })
    } else {
      await payload.create({
        collection: 'push-subscriptions',
        data: {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          user: userId,
        },
      })
    }
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to subscribe user' }
  }
}

export async function unsubscribeUser(subscription: PushSubscriptionData) {
  try {
    const payload = await getPayload({ config: configPromise })

    const existingSubscription = await payload.find({
      collection: 'push-subscriptions',
      where: { endpoint: { equals: subscription.endpoint } },
      limit: 1,
    })

    if (existingSubscription.docs.length > 0) {
      await payload.delete({
        collection: 'push-subscriptions',
        id: existingSubscription.docs[0].id,
      })
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to unsubscribe user' }
  }
}

export async function sendNotificationToAll(
  title: string,
  body: string,
  url?: string,
  image?: string,
) {
  try {
    const payload = await getPayload({ config: configPromise })

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: '/logo.png',
      badge: '/favicon.png',
      image: image || '/og-default.png',
      url: url || '/',
      timestamp: Date.now(),
      requireInteraction: false,
    })

    const allSubscriptions = await payload.find({
      collection: 'push-subscriptions',
      limit: 10000,
    })

    const promises = allSubscriptions.docs.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: sub.keys as { p256dh: string; auth: string },
      }
      try {
        await webpush.sendNotification(subscription, notificationPayload)
        return { success: true, endpoint: subscription.endpoint }
      } catch (error: unknown) {
        const webPushError = error as { statusCode?: number; message?: string }
        if (webPushError.statusCode === 404 || webPushError.statusCode === 410) {
          await payload.delete({
            collection: 'push-subscriptions',
            id: sub.id,
          })
        }
        return {
          success: false,
          endpoint: sub.endpoint,
          error: webPushError.message || 'Unknown error',
        }
      }
    })

    const results = await Promise.allSettled(promises)
    const successful = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success,
    ).length
    const failed = results.length - successful

    return { success: true, sent: successful, failed }
  } catch {
    return { success: false, error: 'Failed to send notifications' }
  }
}

export async function sendNewPostNotification(postId: string) {
  try {
    const payload = await getPayload({ config: configPromise })

    const post = await payload.findByID({
      collection: 'blogPosts',
      id: postId,
      depth: 2,
    })

    if (!post || post.status !== 'published') {
      return { success: false, error: 'Post not found or not published' }
    }

    const title = '📰 New Article Published!'
    const body = `${post.name}`
    const url = `/news/${post.slug}`

    const coverImageUrl = getPostImageFromLayout(post.layout)
    const notificationImage = coverImageUrl
      ? coverImageUrl.startsWith('http')
        ? coverImageUrl
        : `${siteConfig.url}${coverImageUrl}`
      : undefined

    return await sendNotificationToAll(title, body, url, notificationImage)
  } catch {
    return { success: false, error: 'Failed to send new post notification' }
  }
}

export async function getSubscriptionCount() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.find({ collection: 'push-subscriptions' })
  return totalDocs
}

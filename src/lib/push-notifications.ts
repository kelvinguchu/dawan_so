'use server'

import webpush from 'web-push'
import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
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

interface ExtendedExpoPushMessage extends ExpoPushMessage {
  image?: string
  attachments?: Array<{
    url: string
    identifier: string
    typeHint: string
  }>
}

export async function subscribeUser(subscription: PushSubscriptionData) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return { success: false, error: 'Push notifications are not configured on the server' }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const user = (await payload.auth({ headers: new Headers() }))?.user
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

export async function subscribeMobileUser(token: string, platform: 'ios' | 'android' | 'web') {
  try {
    const payload = await getPayload({ config: configPromise })

    const existing = await payload.find({
      collection: 'mobile-push-subscriptions',
      where: { token: { equals: token } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'mobile-push-subscriptions',
        id: existing.docs[0].id,
        data: {
          lastActive: new Date().toISOString(),
          platform,
        },
      })
    } else {
      await payload.create({
        collection: 'mobile-push-subscriptions',
        data: {
          token,
          platform,
          lastActive: new Date().toISOString(),
        },
      })
    }
    return { success: true }
  } catch (error) {
    console.error('Error subscribing mobile user:', error)
    return { success: false, error: 'Failed to subscribe mobile user' }
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

async function sendMobileNotifications(title: string, body: string, data: Record<string, unknown>) {
  const expo = new Expo()
  const payload = await getPayload({ config: configPromise })

  const subscriptions = await payload.find({
    collection: 'mobile-push-subscriptions',
    limit: 10000,
  })

  const messages: ExtendedExpoPushMessage[] = []
  for (const sub of subscriptions.docs) {
    if (!Expo.isExpoPushToken(sub.token)) {
      console.error(`Push token ${sub.token} is not a valid Expo push token`)
      continue
    }

    const message: ExtendedExpoPushMessage = {
      to: sub.token,
      sound: 'default',
      title,
      body,
      data,
    }

    // Add rich media support
    if (data?.imageUrl && typeof data.imageUrl === 'string') {
      // Android - displays in the notification tray
      message.image = data.imageUrl

      // iOS - displays in the notification banner
      message.attachments = [
        {
          url: data.imageUrl,
          identifier: 'image',
          typeHint: 'image',
        },
      ]
    }

    messages.push(message)
  }

  const chunks = expo.chunkPushNotifications(messages as ExpoPushMessage[])

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk)
    } catch (error) {
      console.error(error)
    }
  }
}

export async function sendNotificationToAll(
  title: string,
  body: string,
  url?: string,
  image?: string,
  data?: Record<string, unknown>,
) {
  try {
    // Send Mobile Notifications
    await sendMobileNotifications(title, body, data || { url, image })

    // Send Web Push Notifications
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

    if (post?.status !== 'published') {
      return { success: false, error: 'Post not found or not published' }
    }

    const title = '📰 New Article Published!'
    const body = `${post.name}`
    const url = `/news/${post.slug}`

    const coverImageUrl = getPostImageFromLayout(post.layout)
    let notificationImage: string | undefined = undefined

    if (coverImageUrl) {
      if (coverImageUrl.startsWith('http')) {
        notificationImage = coverImageUrl
      } else {
        notificationImage = `${siteConfig.url}${coverImageUrl}`
      }
    }

    const data = {
      articleSlug: post.slug,
      type: 'new-article',
      imageUrl: notificationImage,
    }

    return await sendNotificationToAll(title, body, url, notificationImage, data)
  } catch {
    return { success: false, error: 'Failed to send new post notification' }
  }
}

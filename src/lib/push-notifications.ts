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
  // iOS attachments (for Notification Service Extension)
  attachments?: Array<{
    url: string
    identifier: string
    typeHint: string
  }>
}

// Batch size for processing subscriptions to avoid memory issues
const SUBSCRIPTION_BATCH_SIZE = 500

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

  let page = 1
  let hasMore = true
  const allMessages: ExtendedExpoPushMessage[] = []

  // Paginate through subscriptions in batches
  while (hasMore) {
    const subscriptions = await payload.find({
      collection: 'mobile-push-subscriptions',
      limit: SUBSCRIPTION_BATCH_SIZE,
      page,
    })

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
        categoryId: 'NEW_ARTICLE_SO',
        channelId: 'new-articles-dawan-so',
        mutableContent: true,
      }

      // Add rich media support
      if (data?.imageUrl && typeof data.imageUrl === 'string') {
        // Android - use richContent.image for BigPicture style
        message.richContent = {
          image: data.imageUrl,
        }

        // iOS - use attachments for Notification Service Extension
        message.attachments = [
          {
            url: data.imageUrl,
            identifier: 'image',
            typeHint: 'image',
          },
        ]
      }

      allMessages.push(message)
    }

    hasMore = subscriptions.hasNextPage ?? false
    page++
  }

  const chunks = expo.chunkPushNotifications(allMessages as ExpoPushMessage[])

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

    let webPage = 1
    let webHasMore = true
    let successful = 0
    let failed = 0

    // Paginate through web subscriptions in batches
    while (webHasMore) {
      const subscriptionsPage = await payload.find({
        collection: 'push-subscriptions',
        limit: SUBSCRIPTION_BATCH_SIZE,
        page: webPage,
      })

      const batchPromises = subscriptionsPage.docs.map(async (sub) => {
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

      const results = await Promise.allSettled(batchPromises)
      successful += results.filter(
        (result) => result.status === 'fulfilled' && result.value.success,
      ).length
      failed +=
        results.length -
        results.filter((result) => result.status === 'fulfilled' && result.value.success).length

      webHasMore = subscriptionsPage.hasNextPage ?? false
      webPage++
    }

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

    // Check if we have already sent a notification for this article
    const existingLog = await payload.find({
      collection: 'notification-logs',
      where: {
        articleSlug: { equals: post.slug },
      },
      limit: 1,
    })

    if (existingLog.totalDocs > 0) {
      return { success: false, error: 'Notification already sent for this post' }
    }

    // Get author name
    let authorName = 'Reporter'
    if (post.useManualReporter && post.manualReporter?.name) {
      authorName = post.manualReporter.name
    } else if (post.author && typeof post.author !== 'string' && post.author.name) {
      authorName = post.author.name
    }

    const title = post.name
    const body = `📰 Maqaal Cusub! • by ${authorName}`
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

    // Rate Limiting Logic
    const now = new Date()
    const hour = now.getHours()
    let timeBlock: 'morning' | 'afternoon' | 'evening'
    let limit = 0

    if (hour >= 0 && hour < 12) {
      timeBlock = 'morning'
      limit = 2
    } else if (hour >= 12 && hour < 18) {
      timeBlock = 'afternoon'
      limit = 2
    } else {
      timeBlock = 'evening'
      limit = 1
    }

    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const logs = await payload.find({
      collection: 'notification-logs',
      where: {
        and: [
          { sentAt: { greater_than_equal: todayStart.toISOString() } },
          { timeBlock: { equals: timeBlock } },
          { type: { equals: 'new-article' } },
        ],
      },
      sort: '-sentAt',
    })

    if (logs.totalDocs >= limit) {
      return { success: false, error: `Rate limit reached for ${timeBlock}` }
    }

    // Check spacing (e.g., 2 hours)
    if (logs.docs.length > 0) {
      const lastSent = new Date(logs.docs[0].sentAt)
      const diffHours = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)
      if (diffHours < 2) {
        return { success: false, error: 'Notification spacing too short' }
      }
    }

    // Log the notification
    await payload.create({
      collection: 'notification-logs',
      data: {
        type: 'new-article',
        sentAt: now.toISOString(),
        timeBlock,
        articleSlug: post.slug,
      },
    })

    return await sendNotificationToAll(title, body, url, notificationImage, data)
  } catch {
    return { success: false, error: 'Failed to send new post notification' }
  }
}



// Handle any runtime messages to prevent port closure errors
self.addEventListener('message', (event) => {

  // Always respond to messages to prevent "message port closed" errors
  if (event.ports && event.ports[0]) {
    // Send a response back through the message port
    event.ports[0].postMessage({
      success: true,
      message: 'Message received by service worker',
    })
  }

  // For other types of messages, you can handle them here
  // For now, just acknowledge all messages
})

// Push notification event handler
self.addEventListener('push', (event) => {

  if (!event.data) {
    console.error('Push event but no data')
    return
  }

  try {
    const data = event.data.json()
    const { title, body, icon, badge, image, url } = data

    const options = {
      body,
      icon: icon || '/logo.png',
      badge: badge || '/favicon.png',
      image: image,
      data: {
        url: url || '/', // URL to open on click
      },
      requireInteraction: false,
      tag: 'dawan-notification', // This helps prevent duplicates
    }

    // CRITICAL: Use event.waitUntil to ensure the notification is shown
    // This is essential for production where the service worker might be terminated quickly
    event.waitUntil(
      self.registration
        .showNotification(title || 'New Notification', options)
        .then(() => {
          
        })
        .catch((error) => {
          console.error('Error showing notification:', error)
          // Fallback notification to prevent iOS Safari from revoking permissions
          return self.registration.showNotification('Dawan TV News', {
            body: 'Stay updated with latest news',
            icon: '/logo.png',
            badge: '/favicon.png',
            tag: 'fallback-notification',
          })
        }),
    )
  } catch (error) {
    console.error('Error parsing push data:', error)
    // Show fallback notification even if parsing fails
    event.waitUntil(
      self.registration.showNotification('Dawan TV News', {
        body: 'Stay updated with latest news',
        icon: '/logo.png',
        badge: '/favicon.png',
        tag: 'fallback-notification',
      }),
    )
  }
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
      .catch((error) => {
        console.error('Error handling notification click:', error)
      }),
  )
})


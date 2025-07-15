import Pusher from "pusher"
import PusherClient from "pusher-js"

// Server-side Pusher instance
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
})

export interface AlertNotification {
  id: string
  userId: string
  latitude: number
  longitude: number
  urgencyScore: number
  message: string
  timestamp: string
}

export class RealtimeService {
  static async notifyNearbyUsers(alert: AlertNotification, radiusKm = 0.1) {
    try {
      // Trigger notification to nearby users channel
      await pusher.trigger("campus-alerts", "new-alert", {
        ...alert,
        radius: radiusKm,
      })

      // Trigger notification to admin channel
      await pusher.trigger("admin-alerts", "new-alert", alert)

      // Trigger notification to security channel
      await pusher.trigger("security-alerts", "new-alert", alert)

      console.log("Real-time notifications sent successfully")
    } catch (error) {
      console.error("Failed to send real-time notifications:", error)
    }
  }

  static async notifyAlertUpdate(alertId: string, status: string) {
    try {
      await pusher.trigger("campus-alerts", "alert-update", {
        alertId,
        status,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to send alert update:", error)
    }
  }
}

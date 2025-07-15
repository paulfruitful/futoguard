"use client"

import type React from "react"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { pusherClient } from "@/lib/realtime"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { addNearbyAlert } = useAppStore()
  const { toast } = useToast()

  useEffect(() => {
    if (!session) return

    // Subscribe to campus alerts
    const campusChannel = pusherClient.subscribe("campus-alerts")

    campusChannel.bind("new-alert", (data: any) => {
      // Add to nearby alerts
      addNearbyAlert(data)

      // Show notification if high urgency
      if (data.urgencyScore > 0.7) {
        toast({
          title: "High Priority Alert",
          description: data.message,
          variant: "destructive",
        })
      }
    })

    campusChannel.bind("alert-update", (data: any) => {
      toast({
        title: "Alert Update",
        description: `Alert ${data.alertId} status: ${data.status}`,
      })
    })

    // Subscribe to admin alerts if admin
    if (session.user.role === "ADMIN") {
      const adminChannel = pusherClient.subscribe("admin-alerts")

      adminChannel.bind("new-alert", (data: any) => {
        toast({
          title: "New Emergency Alert",
          description: `${data.message} - Urgency: ${Math.round(data.urgencyScore * 100)}%`,
          variant: "destructive",
        })
      })
    }

    return () => {
      pusherClient.unsubscribe("campus-alerts")
      if (session.user.role === "ADMIN") {
        pusherClient.unsubscribe("admin-alerts")
      }
    }
  }, [session, addNearbyAlert, toast])

  return <>{children}</>
}

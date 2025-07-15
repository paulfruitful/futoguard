"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { RealtimeProvider } from "@/components/realtime-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RealtimeProvider>{children}</RealtimeProvider>
    </SessionProvider>
  )
}

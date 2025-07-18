import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { aiService } from "@/lib/ai-service"
import { blockchainService } from "@/lib/blockchain"
import { RealtimeService } from "@/lib/realtime"
import { auth } from "@/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { latitude, longitude, audioData, audioTranscript } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Location required" }, { status: 400 })
    }

    // Analyze threat using AI
    const analysis = await aiService.analyzeAudioTranscript(audioTranscript || "Emergency alert triggered", {
      latitude,
      longitude,
    })

    // Create alert in database
    const alert = await prisma.alert.create({
      data: {
        userId: session.user.id,
        latitude,
        longitude,
        audioTranscript,
        urgencyScore: analysis.urgencyScore,
        aiAnalysis: JSON.stringify(analysis),
        status: "ACTIVE",
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    })

    // Log to blockchain (async)
    try {
      const txHash = await blockchainService.logAlert(
        session.user.id,
        Date.now(),
        latitude,
        longitude,
        analysis.urgencyScore,
      )

      await prisma.alert.update({
        where: { id: alert.id },
        data: { blockchainTxId: txHash },
      })
    } catch (blockchainError) {
      console.error("Blockchain logging failed:", blockchainError)
      // Continue without blockchain - don't fail the alert
    }

    // Send real-time notifications
    await RealtimeService.notifyNearbyUsers({
      id: alert.id,
      userId: session.user.id,
      latitude,
      longitude,
      urgencyScore: analysis.urgencyScore,
      message: `Emergency alert from ${alert.user.name || "User"}`,
      timestamp: alert.createdAt.toISOString(),
    })

    return NextResponse.json({
      success: true,
      alert: {
        id: alert.id,
        urgencyScore: analysis.urgencyScore,
        category: analysis.category,
        recommendedActions: analysis.recommendedActions,
      },
    })
  } catch (error) {
    console.error("Alert creation error:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const near = searchParams.get("near")
    const userId = searchParams.get("userId")

    let whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    } else if (near) {
      const [lat, lng] = near.split(",").map(Number)
      // Simple bounding box for nearby alerts (in production, use proper geospatial queries)
      const radius = 0.01 // ~1km
      whereClause = {
        latitude: {
          gte: lat - radius,
          lte: lat + radius,
        },
        longitude: {
          gte: lng - radius,
          lte: lng + radius,
        },
      }
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Fetch alerts error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

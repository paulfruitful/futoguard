import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getBlockchainService } from "@/lib/blockchain"
import { auth } from "@/auth"
import { ethers } from "ethers";


export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { latitude, longitude, audioUrl, audioTranscript, urgencyScore, aiAnalysis } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Location required" }, { status: 400 })
    }

    // Create alert in database
    const alert = await prisma.alert.create({
      data: {
        userId: session.user?.id || '',
        type: "EMERGENCY",
        latitude,
        longitude,
        audioUrl: audioUrl || null,
        audioTranscript: audioTranscript || null,
        urgencyScore: urgencyScore || 0.5,
        aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        status: "ACTIVE",
      },
    })

    // Log to Lisk Sepolia blockchain (only essential metadata: alert ID, timestamp, location hash)
    try {
      console.log(`Sending alert ${alert.id} to Lisk Sepolia blockchain...`)
      
      // Only send the essential metadata to the blockchain

      const blockchainService = getBlockchainService();
      const txHash = await blockchainService.logSOSAlert(  alert.id,
        Date.now(), // Current timestamp
        latitude,
        longitude
      );
      
      // Update alert with blockchain transaction ID
      await prisma.alert.update({
        where: { id: alert.id },
        data: { 
          blockchainTxId: txHash,
          aiAnalysis: JSON.stringify({
            ...JSON.parse(alert.aiAnalysis || '{}'),
            blockchain: {
              network: "Lisk Sepolia",
              txHash,
              timestamp: new Date().toISOString()
            }
          })
        },
      })
      
      console.log(`Alert ${alert.id} successfully logged to Lisk Sepolia blockchain, tx: ${txHash}`)
    } catch (blockchainError) {
      console.error("Blockchain logging failed:", blockchainError)
      // Continue without blockchain - don't fail the alert
    }

    return NextResponse.json({
      success: true,
      alertId: alert.id,
      blockchainLogged: !!alert.blockchainTxId
    })
  } catch (error) {
    console.error("Alert creation error:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}

// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { aiService } from "@/lib/ai-service"
// import { blockchainService } from "@/lib/blockchain"
// import { RealtimeService } from "@/lib/realtime"

// export async function POST(request: NextRequest) {
//   try {
//     const { deviceId, latitude, longitude, triggerType, audioData } = await request.json()

//     if (!deviceId || !latitude || !longitude) {
//       return NextResponse.json({ error: "Device ID and location required" }, { status: 400 })
//     }

//     // Verify IoT device exists
//     const device = await prisma.ioTDevice.findUnique({
//       where: { deviceId },
//     })

//     if (!device) {
//       return NextResponse.json({ error: "Device not registered" }, { status: 404 })
//     }

//     // Create system user for IoT alerts if not exists
//     let systemUser = await prisma.user.findUnique({
//       where: { email: "system@futo.edu.ng" },
//     })

//     if (!systemUser) {
//       systemUser = await prisma.user.create({
//         data: {
//           email: "system@futo.edu.ng",
//           name: "IoT System",
//           role: "ADMIN",
//         },
//       })
//     }

//     // Analyze the trigger
//     const analysis = await aiService.analyzeAudioTranscript(`IoT device ${deviceId} triggered: ${triggerType}`, {
//       latitude,
//       longitude,
//     })

//     // Create alert
//     const alert = await prisma.alert.create({
//       data: {
//         userId: systemUser.id,
//         latitude,
//         longitude,
//         audioTranscript: `Auto-triggered by IoT device: ${triggerType}`,
//         urgencyScore: analysis.urgencyScore,
//         aiAnalysis: JSON.stringify({
//           ...analysis,
//           source: "iot",
//           deviceId,
//           triggerType,
//         }),
//         status: "ACTIVE",
//       },
//     })

//     // Update device last trigger
//     await prisma.ioTDevice.update({
//       where: { deviceId },
//       data: { lastTrigger: new Date() },
//     })

//     // Log to blockchain
//     try {
//       const txHash = await blockchainService.logAlert(
//         systemUser.id,
//         Date.now(),
//         latitude,
//         longitude,
//         analysis.urgencyScore,
//       )

//       await prisma.alert.update({
//         where: { id: alert.id },
//         data: { blockchainTxId: txHash },
//       })
//     } catch (blockchainError) {
//       console.error("Blockchain logging failed:", blockchainError)
//     }

//     // Send real-time notifications
//     await RealtimeService.notifyNearbyUsers({
//       id: alert.id,
//       userId: systemUser.id,
//       latitude,
//       longitude,
//       urgencyScore: analysis.urgencyScore,
//       message: `IoT Alert: ${triggerType} detected at ${device.name}`,
//       timestamp: alert.createdAt.toISOString(),
//     })

//     return NextResponse.json({
//       success: true,
//       alertId: alert.id,
//       analysis,
//     })
//   } catch (error) {
//     console.error("IoT trigger error:", error)
//     return NextResponse.json({ error: "Failed to process IoT trigger" }, { status: 500 })
//   }
// }

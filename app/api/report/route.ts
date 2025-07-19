// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { aiService } from "@/lib/ai-service"
// import { blockchainService } from "@/lib/blockchain"
// import { auth } from "@/auth"

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth()
//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { latitude, longitude, description, category, severity, requiresAiAnalysis } = await request.json()

//     if (!latitude || !longitude || !description) {
//       return NextResponse.json({ error: "Location and description required" }, { status: 400 })
//     }

//     let aiAnalysis = null
//     let finalSeverity = severity || "MEDIUM"
//     let blockchainTxId = null

//     // Perform AI analysis if requested
//     if (requiresAiAnalysis) {
//       try {
//         const analysis = await aiService.analyzeReport(
//           description,
//           category || "other",
//           { latitude, longitude }
//         )

//         aiAnalysis = analysis
//         finalSeverity = analysis.severity

//         // Log critical reports to blockchain
//         if (analysis.requiresBlockchain && (analysis.severity === 'HIGH' || analysis.severity === 'CRITICAL')) {
//           try {
//             const reportHash = await blockchainService.hashData({
//               description,
//               location: { latitude, longitude },
//               timestamp: Date.now(),
//               severity: analysis.severity
//             })

//             blockchainTxId = await blockchainService.logReport(
//               session.user.id,
//               reportHash,
//               analysis.urgencyScore
//             )
//           } catch (blockchainError) {
//             console.error('Blockchain logging failed:', blockchainError)
//             // Continue without blockchain - don't fail the report
//           }
//         }
//       } catch (aiError) {
//         console.error('AI analysis failed:', aiError)
//         // Continue without AI analysis
//       }
//     }

//     const report = await prisma.report.create({
//       data: {
//         userId: session.user.id,
//         latitude,
//         longitude,
//         description,
//         category: category || "other",
//         severity: finalSeverity,
//         status: "PENDING",
//         aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
//         blockchainTxId,
//       },
//     })

//     return NextResponse.json({
//       success: true,
//       reportId: report.id,
//       aiAnalysis: aiAnalysis ? {
//         severity: aiAnalysis.severity,
//         urgencyScore: aiAnalysis.urgencyScore,
//         dangerKeywords: aiAnalysis.dangerKeywords,
//         requiresBlockchain: aiAnalysis.requiresBlockchain
//       } : null,
//       blockchainLogged: !!blockchainTxId
//     })
//   } catch (error) {
//     console.error("Report creation error:", error)
//     return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
//   }
// }

// export async function GET() {
//   try {
//     const reports = await prisma.report.findMany({
//       orderBy: { createdAt: "desc" },
//       take: 100,
//     })

//     return NextResponse.json({ reports })
//   } catch (error) {
//     console.error("Fetch reports error:", error)
//     return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
//   }
// }

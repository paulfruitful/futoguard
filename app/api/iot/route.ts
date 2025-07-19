// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { aiService } from '@/lib/ai-service'
// import { blockchainService } from '@/lib/blockchain'
// import { RealtimeService } from '@/lib/realtime'
// import { auth } from '@/auth'

// // POST /api/iot - Handle IoT device alerts and emergency detection
// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth()

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const body = await request.json()
//     const {
//       deviceId,
//       location,
//       audioAnalysis,
//       confidence,
//       alertType = 'SOUND_TRIGGER',
//       metadata
//     } = body

//     // Validate required fields
//     if (!deviceId || !location || !audioAnalysis) {
//       return NextResponse.json(
//         { error: 'Missing required fields: deviceId, location, audioAnalysis' },
//         { status: 400 }
//       )
//     }

//     // Create IoT alert in database
//     const iotAlert = await prisma.alert.create({
//       data: {
//         userId: session.user.id,
//         location: JSON.stringify(location),
//         status: 'active',
//         priority: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
//         aiAnalysis: JSON.stringify({
//           confidence,
//           audioAnalysis,
//           alertType,
//           deviceId,
//           detectionMethod: 'IoT_SOUND_TRIGGER',
//           timestamp: new Date().toISOString()
//         }),
//         metadata: JSON.stringify({
//           ...metadata,
//           deviceId,
//           alertType,
//           isIoTGenerated: true
//         })
//       }
//     })

//     // Log to blockchain if high confidence
//     if (confidence > 0.7) {
//       try {
//         await blockchainService.logAlert(
//           iotAlert.id,
//           location,
//           {
//             confidence,
//             alertType,
//             deviceId,
//             detectionMethod: 'IoT_SOUND_TRIGGER'
//           }
//         )
//       } catch (blockchainError) {
//         console.error('Blockchain logging failed:', blockchainError)
//         // Continue without blockchain - don't fail the alert
//       }
//     }

//     // Send real-time notifications to nearby users
//     try {
//       await RealtimeService.notifyNearbyUsers({
//         alertId: iotAlert.id,
//         location,
//         message: `Emergency detected by IoT sensor (${Math.round(confidence * 100)}% confidence)`,
//         priority: iotAlert.priority,
//         type: 'IOT_EMERGENCY',
//         deviceId
//       })
//     } catch (realtimeError) {
//       console.error('Real-time notification failed:', realtimeError)
//     }

//     return NextResponse.json({
//       success: true,
//       alertId: iotAlert.id,
//       message: 'IoT emergency alert processed successfully',
//       confidence,
//       priority: iotAlert.priority
//     })

//   } catch (error) {
//     console.error('IoT alert processing error:', error)
//     return NextResponse.json(
//       { error: 'Failed to process IoT alert' },
//       { status: 500 }
//     )
//   }
// }

// // GET /api/iot - Get IoT device status and recent alerts
// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth()

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const deviceId = searchParams.get('deviceId')
//     const limit = parseInt(searchParams.get('limit') || '50')

//     // Build query conditions
//     const whereConditions: any = {
//       metadata: {
//         path: ['isIoTGenerated'],
//         equals: true
//       }
//     }

//     if (deviceId) {
//       whereConditions.metadata = {
//         path: ['deviceId'],
//         equals: deviceId
//       }
//     }

//     // Get recent IoT alerts
//     const iotAlerts = await prisma.alert.findMany({
//       where: whereConditions,
//       orderBy: { createdAt: 'desc' },
//       take: limit,
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         }
//       }
//     })

//     // Get device statistics
//     const deviceStats = await prisma.alert.groupBy({
//       by: ['priority'],
//       where: {
//         metadata: {
//           path: ['isIoTGenerated'],
//           equals: true
//         },
//         createdAt: {
//           gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
//         }
//       },
//       _count: {
//         id: true
//       }
//     })

//     // Simulate IoT device status (in real implementation, this would come from device registry)
//     const mockDevices = [
//       {
//         id: 'device_001',
//         name: 'Library Sensor',
//         location: 'Main Library',
//         status: 'online',
//         lastPing: new Date().toISOString(),
//         batteryLevel: 85,
//         signalStrength: 92
//       },
//       {
//         id: 'device_002',
//         name: 'Cafeteria Sensor',
//         location: 'Student Cafeteria',
//         status: 'online',
//         lastPing: new Date().toISOString(),
//         batteryLevel: 67,
//         signalStrength: 88
//       },
//       {
//         id: 'device_003',
//         name: 'Parking Sensor',
//         location: 'Parking Lot A',
//         status: 'offline',
//         lastPing: new Date(Date.now() - 300000).toISOString(),
//         batteryLevel: 23,
//         signalStrength: 0
//       }
//     ]

//     return NextResponse.json({
//       success: true,
//       alerts: iotAlerts.map(alert => ({
//         ...alert,
//         location: JSON.parse(alert.location),
//         aiAnalysis: JSON.parse(alert.aiAnalysis || '{}'),
//         metadata: JSON.parse(alert.metadata || '{}')
//       })),
//       deviceStats: deviceStats.reduce((acc, stat) => {
//         acc[stat.priority] = stat._count.id
//         return acc
//       }, {} as Record<string, number>),
//       devices: mockDevices,
//       totalAlerts: iotAlerts.length
//     })

//   } catch (error) {
//     console.error('IoT data retrieval error:', error)
//     return NextResponse.json(
//       { error: 'Failed to retrieve IoT data' },
//       { status: 500 }
//     )
//   }
// }

// // PUT /api/iot - Update IoT device configuration
// export async function PUT(request: NextRequest) {
//   try {
//     const session = await auth()

//     // Only admins can update IoT device configuration
//     if (!session?.user?.id || session.user.role !== 'admin') {
//       return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
//     }

//     const body = await request.json()
//     const { deviceId, configuration } = body

//     if (!deviceId || !configuration) {
//       return NextResponse.json(
//         { error: 'Missing required fields: deviceId, configuration' },
//         { status: 400 }
//       )
//     }

//     // In a real implementation, this would update the device configuration
//     // via MQTT, HTTP API, or device management platform
//     console.log(`Updating device ${deviceId} configuration:`, configuration)

//     // Log configuration change
//     await prisma.alert.create({
//       data: {
//         userId: session.user.id,
//         location: JSON.stringify({ latitude: 0, longitude: 0 }),
//         status: 'resolved',
//         priority: 'low',
//         aiAnalysis: JSON.stringify({
//           action: 'DEVICE_CONFIG_UPDATE',
//           deviceId,
//           configuration,
//           updatedBy: session.user.id,
//           timestamp: new Date().toISOString()
//         }),
//         metadata: JSON.stringify({
//           isConfigUpdate: true,
//           deviceId,
//           updatedBy: session.user.name || session.user.email
//         })
//       }
//     })

//     return NextResponse.json({
//       success: true,
//       message: `Device ${deviceId} configuration updated successfully`,
//       deviceId,
//       configuration
//     })

//   } catch (error) {
//     console.error('IoT configuration update error:', error)
//     return NextResponse.json(
//       { error: 'Failed to update IoT device configuration' },
//       { status: 500 }
//     )
//   }
// }
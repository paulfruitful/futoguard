import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get alerts within the time period
    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        latitude: true,
        longitude: true,
        urgencyScore: true,
        createdAt: true,
      },
    })

    // Get reports within the time period
    const reports = await prisma.report.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        latitude: true,
        longitude: true,
        severity: true,
        createdAt: true,
      },
    })

    // Create heatmap data by grouping nearby incidents
    const heatmapData = []
    const gridSize = 0.001 // ~100m grid cells

    // Combine alerts and reports
    const allIncidents = [
      ...alerts.map((a) => ({
        lat: a.latitude,
        lng: a.longitude,
        intensity: a.urgencyScore,
        type: "alert",
      })),
      ...reports.map((r) => ({
        lat: r.latitude,
        lng: r.longitude,
        intensity: r.severity === "CRITICAL" ? 1 : r.severity === "HIGH" ? 0.8 : r.severity === "MEDIUM" ? 0.6 : 0.4,
        type: "report",
      })),
    ]

    // Group incidents into grid cells
    const grid = new Map()

    allIncidents.forEach((incident) => {
      const gridLat = Math.floor(incident.lat / gridSize) * gridSize
      const gridLng = Math.floor(incident.lng / gridSize) * gridSize
      const key = `${gridLat},${gridLng}`

      if (!grid.has(key)) {
        grid.set(key, {
          latitude: gridLat,
          longitude: gridLng,
          count: 0,
          totalIntensity: 0,
          alerts: 0,
          reports: 0,
        })
      }

      const cell = grid.get(key)
      cell.count++
      cell.totalIntensity += incident.intensity
      if (incident.type === "alert") cell.alerts++
      else cell.reports++
    })

    // Convert to heatmap format
    grid.forEach((cell) => {
      heatmapData.push({
        latitude: cell.latitude,
        longitude: cell.longitude,
        intensity: cell.totalIntensity / cell.count,
        count: cell.count,
        alerts: cell.alerts,
        reports: cell.reports,
      })
    })

    return NextResponse.json({
      heatmapData,
      summary: {
        totalAlerts: alerts.length,
        totalReports: reports.length,
        averageUrgency: alerts.reduce((sum, a) => sum + a.urgencyScore, 0) / alerts.length || 0,
        timeRange: { start: startDate, end: new Date() },
      },
    })
  } catch (error) {
    console.error("Heatmap generation error:", error)
    return NextResponse.json({ error: "Failed to generate heatmap data" }, { status: 500 })
  }
}

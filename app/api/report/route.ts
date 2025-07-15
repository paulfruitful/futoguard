import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, description, category, severity } = await request.json()

    if (!latitude || !longitude || !description) {
      return NextResponse.json({ error: "Location and description required" }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        latitude,
        longitude,
        description,
        category: category || "other",
        severity: severity || "MEDIUM",
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: true,
      reportId: report.id,
    })
  } catch (error) {
    console.error("Report creation error:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Fetch reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

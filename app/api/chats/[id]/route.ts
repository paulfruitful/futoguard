import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    const currentUserId = session?.user?.id

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                fullname: true,
                passport: true,
                displayPicture: true,
              },
            },
          },
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const participant = chat.participants.find((p) => p.userId !== currentUserId)?.user

    return NextResponse.json({
      id: chat.id,
      participant,
    })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

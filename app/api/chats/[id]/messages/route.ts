import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const messages = await prisma.message.findMany({
      where: { chatId: id },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            fullname: true,
            passport: true,
            displayPicture: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                fullname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('ABout to send a message')
    const { id } = await params
    const { content, replyToId } = await request.json()

    const session = await auth()
    const currentUserId = session?.user?.id

    const message = await prisma.message.create({
      data: {
        content,
        chatId: id,
        senderId: currentUserId,
        replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            fullname: true,
            passport: true,
            displayPicture: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                fullname: true,
              },
            },
          },
        },
      },
    })
    console.log('Message sent', message)

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

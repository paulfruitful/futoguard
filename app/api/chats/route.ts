import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"


export async function GET() {
  try {
    // In a real app, get current user from auth
    const session = await auth()
    // console.log('session', session)
    const currentUserId = session?.user?.id
    console.log('about to fetch curent users chat list', currentUserId)

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: currentUserId,
          },
        },
      },
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
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: {
                  not: currentUserId,
                },
                // readAt: null,
              },
            },
          },
        },
      },
    })

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      participant: chat.participants.find((p) => p.userId !== currentUserId)?.user,
      lastMessage: chat.messages[0] || null,
      unreadCount: chat._count.messages,
    }))

    console.log('this was gotten from the server', formattedChats)

    return NextResponse.json(formattedChats)
  } catch (error) {
    console.log("Error fetching chats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const formattedChats = chats.map((chat) => {
      // For direct chats, get the other participant
      const otherParticipant = chat.participants.find((p) => p.userId !== currentUserId)

      return {
        id: chat.id,
        type: chat.type,
        name: chat.name,
        participant: otherParticipant?.user || null,
        lastMessage: chat.messages[0]
          ? {
            id: chat.messages[0].id,
            content: chat.messages[0].content,
            senderId: chat.messages[0].senderId,
            createdAt: chat.messages[0].createdAt.toISOString(),
            sender: chat.messages[0].sender,
          }
          : null,
        unreadCount: chat._count.messages,
        updatedAt: chat.updatedAt.toISOString(),
      }
    })

    console.log('chats were gotten from the server')

    return NextResponse.json(formattedChats)
  } catch (error) {
    console.log("Error fetching chats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



export async function POST(request: Request) {
  try {
    const { participantIds, type = "DIRECT", name, description } = await request.json()

    // Get current user ID from auth (you'll need to implement this)
    const currentUserId = "current-user-id" // Replace with actual auth

    if (!participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json({ error: "Participant IDs are required" }, { status: 400 })
    }

    // For direct chats, ensure only 2 participants (including current user)
    if (type === "DIRECT" && participantIds.length !== 1) {
      return NextResponse.json({ error: "Direct chats must have exactly 2 participants" }, { status: 400 })
    }

    // Verify all participant users exist
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
      select: { id: true, fullname: true, displayName: true },
    })

    if (participants.length !== participantIds.length) {
      return NextResponse.json({ error: "One or more participants not found" }, { status: 404 })
    }

    // Create the chat
    const chat = await prisma.chat.create({
      data: {
        type,
        name,
        description,
        participants: {
          create: [
            // Add current user as admin for group chats, member for direct chats
            {
              userId: currentUserId,
              role: type === "GROUP" ? "ADMIN" : "MEMBER",
            },
            // Add other participants as members
            ...participantIds.map((participantId: string) => ({
              userId: participantId,
              role: "MEMBER" as const,
            })),
          ],
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
      },
    })

    return NextResponse.json({
      message: "Chat created successfully",
      chat: {
        id: chat.id,
        type: chat.type,
        name: chat.name,
        description: chat.description,
        participants: chat.participants.map((p) => ({
          id: p.id,
          userId: p.userId,
          role: p.role,
          user: p.user,
        })),
      },
    })
  } catch (error) {
    console.log("Error creating chat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

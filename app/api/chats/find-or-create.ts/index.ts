import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { participantId } = await request.json()

        const session = await auth()
        // Get current user ID from auth (you'll need to implement this)
        const currentUserId = session?.user?.id// Replace with actual auth


        if (!participantId) {
            return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
        }

        if (currentUserId === participantId) {
            return NextResponse.json({ error: "Cannot create chat with yourself" }, { status: 400 })
        }

        // Check if the participant user exists
        const participantUser = await prisma.user.findUnique({
            where: { id: participantId },
            select: { id: true, fullname: true, displayName: true },
        })

        if (!participantUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Try to find an existing direct chat between these two users
        const existingChat = await prisma.chat.findFirst({
            where: {
                type: "DIRECT",
                participants: {
                    every: {
                        userId: {
                            in: [currentUserId, participantId],
                        },
                    },
                },
                AND: [
                    {
                        participants: {
                            some: {
                                userId: currentUserId,
                            },
                        },
                    },
                    {
                        participants: {
                            some: {
                                userId: participantId,
                            },
                        },
                    },
                ],
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullname: true,
                                displayName: true,
                                passport: true,
                                displayPicture: true,
                            },
                        },
                    },
                },
            },
        })

        if (existingChat) {
            // Chat already exists, return it
            return NextResponse.json({
                chatId: existingChat.id,
                isNew: false,
                message: "Existing chat found",
            })
        }

        // No existing chat found, create a new one
        const newChat = await prisma.chat.create({
            data: {
                type: "DIRECT",
                participants: {
                    create: [
                        {
                            userId: currentUserId,
                            role: "MEMBER",
                        },
                        {
                            userId: participantId,
                            role: "MEMBER",
                        },
                    ],
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullname: true,
                                displayName: true,
                                passport: true,
                                displayPicture: true,
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json({
            chatId: newChat.id,
            isNew: true,
            message: "New chat created successfully",
            chat: {
                id: newChat.id,
                type: newChat.type,
                participants: newChat.participants.map((p) => ({
                    id: p.id,
                    userId: p.userId,
                    role: p.role,
                    user: p.user,
                })),
            },
        })
    } catch (error) {
        console.error("Error finding or creating chat:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

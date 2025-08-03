import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        console.log("Removing emergency contact...")

        const { id } = await params
        const session = await auth()
        // Get current user ID from auth (you'll need to implement this)
        const currentUserId = session?.user?.id// Replace with actual auth
        console.log("Removing emergency contact with ID:", id)
        // Find the emergency contact
        const emergencyContact = await prisma.emergencyContact.findUnique({
            where: { id },
            include: {
                contact: {
                    select: {
                        fullname: true,
                    },
                },
            },
        })
        console.log("Emergency contact found:", emergencyContact)

        if (!emergencyContact) {
            console.log("Emergency contact not found:", id)
            return NextResponse.json({ error: "Emergency contact not found" }, { status: 404 })
        }

        // Verify the contact belongs to the current user
        if (emergencyContact.userId !== currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Delete the emergency contact
        await prisma.emergencyContact.delete({
            where: { id },
        })

        return NextResponse.json({
            message: `${emergencyContact.contact.fullname} removed from emergency contacts`,
        })
    } catch (error) {
        console.error("Error removing emergency contact:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const session = await auth()
        const currentUserId = session?.user?.id

        const emergencyContact = await prisma.emergencyContact.findUnique({
            where: { id },
            include: {
                contact: {
                    select: {
                        id: true,
                        fullname: true,
                        displayName: true,
                        email: true,
                        mobileNumber: true,
                        displayMobileNumber: true,
                        passport: true,
                        displayPicture: true,
                        lastSeen: true,
                    },
                },
            },
        })

        if (!emergencyContact) {
            return NextResponse.json({ error: "Emergency contact not found" }, { status: 404 })
        }

        // Verify the contact belongs to the current user
        if (emergencyContact.userId !== currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const transformedContact = {
            id: emergencyContact.id,
            userId: emergencyContact.userId,
            contactId: emergencyContact.contactId,
            createdAt: emergencyContact.createdAt.toISOString(),
            contact: {
                id: emergencyContact.contact.id,
                name: emergencyContact.contact.displayName || emergencyContact.contact.fullname,
                email: emergencyContact.contact.email,
                phone: emergencyContact.contact.displayMobileNumber || emergencyContact.contact.mobileNumber,
                avatar: emergencyContact.contact.displayPicture || emergencyContact.contact.passport,
                // isOnline: emergencyContact.contact.isOnline || false,
                lastSeen: emergencyContact.contact.lastSeen.toISOString(),
            },
        }

        return NextResponse.json(transformedContact)
    } catch (error) {
        console.error("Error fetching emergency contact:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

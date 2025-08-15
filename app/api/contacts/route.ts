import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // assuming you’re using Auth.js or NextAuth
import { prisma } from "@/lib/prisma"; // adjust the import based on your project structure


export async function POST(req: NextRequest) {
    try {
        console.log("Adding emergency contact...");
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Session user ID:", session.user.id);
        const body = await req.json();
        console.log("Request body:", body);
        const { contactId } = body;

        if (!contactId || typeof contactId !== "string") {
            console.error("Invalid contactId:", contactId);
            return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 });
        }

        if (contactId === session.user.id) {
            console.error("User cannot add themselves as an emergency contact");
            return NextResponse.json({ error: "You cannot add yourself" }, { status: 400 });
        }

        const alreadyExists = await prisma.emergencyContact.findUnique({
            where: {
                userId_contactId: {
                    userId: session.user.id,
                    contactId,
                },
            },
        });

        if (alreadyExists) {
            console.log("Emergency contact already exists");
            return NextResponse.json({ message: "Already added" }, { status: 200 });
        }

        const contact = await prisma.user.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            console.error("Contact user not found:", contactId);
            return NextResponse.json({ error: "Contact user not found" }, { status: 404 });
        }

        const added = await prisma.emergencyContact.create({
            data: {
                userId: session.user.id,
                contactId: contactId,
            },
        });
        console.log("Emergency contact added:", added);

        return NextResponse.json({ message: "Emergency contact added", data: added }, { status: 201 });
    } catch (error) {
        console.error("Failed to add emergency contact:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


export async function GET() {
    try {
        const session = await auth()
        // Get current user ID from auth (you'll need to implement this)
        const currentUserId = session?.user?.id// Replace with actual auth

        const emergencyContacts = await prisma.emergencyContact.findMany({
            where: {
                userId: currentUserId,
            },
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
            orderBy: {
                createdAt: "desc",
            },
        })

        // Transform data to match frontend interface
        const transformedContacts = emergencyContacts.map((ec) => ({
            id: ec.id,
            userId: ec.userId,
            contactId: ec.contactId,
            createdAt: ec.createdAt.toISOString(),
            contact: {
                id: ec.contact.id,
                name: ec.contact.displayName || ec.contact.fullname,
                email: ec.contact.email,
                phone: ec.contact.displayMobileNumber || ec.contact.mobileNumber || "",
                avatar: ec.contact.displayPicture || ec.contact.passport,
                lastSeen: ec.contact.lastSeen.toISOString(),
            },
        }))

        return NextResponse.json(transformedContacts)
    } catch (error) {
        console.error("Error fetching emergency contacts:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
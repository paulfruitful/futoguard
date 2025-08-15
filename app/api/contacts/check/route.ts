// app/api/emergency-contact/check/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cos } from "@tensorflow/tfjs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log('checking...')

        const { contactId } = await req.json();
        if (!contactId) {
            return NextResponse.json({ error: "contactId is required" }, { status: 400 });
        }

        const exists = await prisma.emergencyContact.findFirst({
            where: {
                userId: session.user.id,
                contactId,
            },
        });
        console.log("Contact exists:", exists);

        return NextResponse.json({ connected: !!exists });
    } catch (error) {
        console.error("Error checking contact:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
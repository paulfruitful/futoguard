import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"



export async function GET() {
    console.log("Fetching users...")
    try {
        const users = await prisma.user.findMany({
            take: 100,
        })
        console.log("Fetched users:", users)
        return NextResponse.json(users)
    } catch (error) {
        console.error("Fetch users error:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

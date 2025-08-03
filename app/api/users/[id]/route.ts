import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullname: true,
                displayName: true,
                email: true,
                passport: true,
                displayPicture: true,
                mobileNumber: true,
                displayMobileNumber: true,
                displayAddress: true,
                latitude: true,
                longitude: true,
                department: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true,
                // Add any additional fields you need
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Transform data to match frontend interface
        // const transformedUser = {
        //   id: user.id,
        //   name: user.name,
        //   email: user.email,
        //   phone: user.phone,
        //   avatar: user.avatar,
        //   address: user.address,
        //   latitude: user.latitude,
        //   longitude: user.longitude,
        //   department: "Computer Engineering", // You might want to add this to your schema
        //   faculty: "School of Engineering and Engineering Technology", // You might want to add this to your schema
        //   year: "2023", // You might want to add this to your schema
        //   isOnline: user.isOnline,
        //   lastSeen: user.lastSeen.toISOString(),
        //   createdAt: user.createdAt.toISOString(),
        // }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Error fetching user:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params
//     const body = await request.json()

//     // Get current user ID from auth (you'll need to implement this)
//     const currentUserId = "current-user-id" // Replace with actual auth

//     // Only allow users to update their own profile
//     if (id !== currentUserId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: {
//         name: body.name,
//         phone: body.phone,
//         address: body.address,
//         latitude: body.latitude ? Number.parseFloat(body.latitude) : null,
//         longitude: body.longitude ? Number.parseFloat(body.longitude) : null,
//         avatar: body.avatar,
//         updatedAt: new Date(),
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         avatar: true,
//         phone: true,
//         address: true,
//         latitude: true,
//         longitude: true,
//         isOnline: true,
//         lastSeen: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     })

//     return NextResponse.json(updatedUser)
//   } catch (error) {
//     console.error("Error updating user:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params

//     // Get current user ID from auth (you'll need to implement this)
//     const currentUserId = "current-user-id" // Replace with actual auth

//     // Only allow users to delete their own profile or admin users
//     if (id !== currentUserId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
//     }

//     await prisma.user.delete({
//       where: { id },
//     })

//     return NextResponse.json({ message: "User deleted successfully" })
//   } catch (error) {
//     console.error("Error deleting user:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

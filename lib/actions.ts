'use server'

import { prisma } from "./prisma";


export const upsertFutoUser = async (data: {
    email: string;
    name: string;
    image?: string;
    studentId?: string;
    phoneNumber?: string;
    gender?: string;
    address?: string;
    department?: string;
}) => {
    try {
        console.log('About to upsert a user', data)
        const user = await prisma.user.upsert({
            where: { email: data.email },
            update: {
                ...data,
            },
            create: {
                ...data,
                role: "USER",
            },
        });
        console.log('Successgull', user)
        return user;
    } catch (error) {
        console.error("❌ Error in upsertFutoUser:", error);

        // Optionally, you can rethrow or return a more structured error
        throw new Error("Failed to upsert user.");
        // OR: return { error: "Failed to upsert user." };
    }
};

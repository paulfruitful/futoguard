'use server'

import { prisma } from "./prisma";


interface FutoUserData {
    email: string;
    fullname: string;
    passport?: string;
    studentId?: string;
    phoneNumber?: string;
    gender?: string;
    contactAddress?: string;
    mobileNumber?: string;
    dateOfBirth?: string;
    state?: string;
    religion?: string;
    matricNumber?: string;
    level?: string;
    department?: string;
    modeOfEntry?: string;
    id?: string;
    username?: string;
    displayName?: string;
    displayPicture?: string;
    displaMobileNumber?: string;
    displayAddress?: string;
}

interface ApiResponseData {
    personalData: {
        email: string;
        fullname: string;
        studentId?: string;
        mobileNumber?: string;
        contactAddress?: string;
        dateOfBirth?: string;
        state?: string;
        religion?: string;
        passport?: string;
        username?: string;
        gender?: string;
    };
    programmeDetail: {
        matricNumber?: string;
        level?: string;
        department?: string;
        modeOfEntry?: string;
    };
}

export const upsertFutoUser = async (data: ApiResponseData) => {
    try {
        console.log("Checking if user exists:", data.personalData.email);

        // See if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.personalData.email },
        });

        if (existingUser) {
            console.log("✅ User already exists, returning existing record.");
            return existingUser;
        }

        console.log("ℹ No user found, creating a new one...");

        const userData: FutoUserData = {
            email: data.personalData.email,
            fullname: data.personalData.fullname,
            passport: data.personalData.passport,
            mobileNumber: data.personalData.mobileNumber,
            gender: data.personalData.gender,
            contactAddress: data.personalData.contactAddress,
            dateOfBirth: data.personalData.dateOfBirth?.split("T")[0],
            state: data.personalData.state,
            religion: data.personalData.religion,
            matricNumber: data.programmeDetail.matricNumber,
            level: data.programmeDetail.level,
            department: data.programmeDetail.department,
            modeOfEntry: data.programmeDetail.modeOfEntry,
            id: data.programmeDetail.matricNumber,
            username: data.programmeDetail.matricNumber,
        };

        const newUser = await prisma.user.create({
            data: userData,
        });

        console.log("✅ User created successfully:", newUser);
        return newUser;
    } catch (error) {
        console.error("❌ Error in createOrFetchFutoUser:", error);
        throw new Error("Failed to create or fetch user.");
    }
};


interface UpdateUserProfileParams {
    userId: string;
    displayName?: string;
    phoneNumber?: string;
    address?: string;
    profilePicture?: string | null;
}

export async function updateUserProfile({
    userId,
    displayName,
    phoneNumber,
    address,
    profilePicture,
}: UpdateUserProfileParams) {
    try {
        console.log('Updating user profile:', userId)
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(displayName && { displayName: displayName }), // Only update if provided
                ...(phoneNumber && { displayMobileNumber: phoneNumber }),
                ...(address && { displayAddress: address }),
                ...(profilePicture !== undefined && { displayPicture: profilePicture }),
            },
        });
        console.log('User profile updated successfully:', updatedUser);
        return {
            success: true,
            data: updatedUser,
        };
    } catch (error) {
        console.error("Prisma update error:", error);
        return {
            success: false,
            message: "Failed to update profile. User may not exist.",
        };
    }
}
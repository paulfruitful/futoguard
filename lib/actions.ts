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
        console.log('About to upsert a user', data.personalData.fullname);

        const userData: FutoUserData = {
            email: data.personalData.email,
            fullname: data.personalData.fullname,
            passport: data.personalData.passport,
            // studentId: data.personalData.studentId?.toString(), // Convert to string if needed
            // phoneNumber: data.personalData.mobileNumber,
            mobileNumber: data.personalData.mobileNumber,
            gender: data.personalData.gender,
            contactAddress: data.personalData.contactAddress,
            dateOfBirth: data.personalData.dateOfBirth?.split('T')[0], // Extract just the date part
            state: data.personalData.state,
            religion: data.personalData.religion,
            matricNumber: data.programmeDetail.matricNumber,
            level: data.programmeDetail.level,
            department: data.programmeDetail.department,
            modeOfEntry: data.programmeDetail.modeOfEntry,
            id: data.programmeDetail.matricNumber, // Using email as ID
            username: data.programmeDetail.matricNumber
        };

        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: userData,
            create: userData
        });

        console.log('Successful', user);
        return user;
    } catch (error) {
        console.error("❌ Error in upsertFutoUser:", error);
        throw new Error("Failed to upsert user.");
    }
};

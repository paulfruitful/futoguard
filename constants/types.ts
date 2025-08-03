export type User = {
    id: string;
    fullname?: string | null;
    username?: string | null;
    email: string;
    gender?: string | null;
    dateOfBirth?: string | null;
    state?: string | null;
    mobileNumber?: string | null;
    religion?: string | null;
    passport?: string | null;
    matricNumber?: string | null;
    department?: string | null;
    faculty?: string | null;
    level?: string | null;
    modeOfEntry?: string | null;
    contactAddress?: string | null;

    displayName?: string | null;
    displayPicture?: string | null;
    displayMobileNumber?: string | null;
    displayAddress?: string | null;

    latitude?: number | null;
    longitude?: number | null;
    lastSeen: Date;

    createdAt: string;
    updatedAt: string;
};

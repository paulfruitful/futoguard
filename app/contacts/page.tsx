import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Suspense } from "react";
import { ContactsPageSkeleton } from "@/components/contacts/contacts-page-skeleton";
import { ContactsPageClient } from "@/components/contacts/contacts-page-client";

interface EmergencyContact {
  id: string;
  userId: string;
  contactId: string;
  createdAt: string;
  contact: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    email: string;
    isOnline: boolean;
    lastSeen: string;
  };
}

// Server-side data fetching
async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/contacts`,
      {
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch emergency contacts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return [];
  }
}

export default async function ContactsPage() {
  const initialContacts = await getEmergencyContacts();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Emergency Contacts" showBack />

      <Suspense fallback={<ContactsPageSkeleton />}>
        <ContactsPageClient initialContacts={initialContacts} />
      </Suspense>

      <BottomNavigation />
    </div>
  );
}

// Generate metadata for SEO
export const metadata = {
  title: "Emergency Contacts - Futo Guard",
  description:
    "Manage your emergency contacts for quick access during emergencies",
};

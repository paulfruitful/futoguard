// "use client";
import { MobileHeader } from "@/components/mobile-header";
import { UsersPageClient } from "@/components/users/users-page-client";
import { UsersPageSkeleton } from "@/components/users/users-page-skeleton";
import { Suspense } from "react";

// Server-side data fetching
async function getInitialUsers() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/users`,
      {
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function UsersPage() {
  const initialUsers = await getInitialUsers();

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Users" />

      <Suspense fallback={<UsersPageSkeleton />}>
        <UsersPageClient initialUsers={initialUsers} />
      </Suspense>
    </div>
  );
}

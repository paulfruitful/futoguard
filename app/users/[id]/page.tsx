import { User } from "@/constants/types";
import UserDetailPageClient from "../../../components/users/UserDetailPageClient";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

// Server-side data fetching
async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/users/${id}`,
      {
        cache: "no-store", // Always fetch fresh data for user profiles
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  return <UserDetailPageClient params={params} user={user} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.displayName || user.fullname} - Futo Guard`,
    description: `View ${
      user.displayName || user.fullname
    }'s profile on Futo Guard`,
  };
}

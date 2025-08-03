"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { UserActions } from "@/components/users/user-actions";
import { UserDetailsCard } from "@/components/users/user-details-card";
import { User } from "@/constants/types";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
  user: User | null;
}

// Helper function to format last seen time
function formatLastSeen(lastSeen: Date): string {
  const date = new Date(lastSeen);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440)
    return `${Math.floor(diffInMinutes / 60)} hours ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function UserDetailPageClient({
  params,
  user,
}: UserDetailPageProps) {
  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => window.history.back()}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div className="flex-1"></div>
        <Button variant="ghost" size="icon">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage
                src={user.displayPicture || user.passport || "/placeholder.svg"}
              />
              <AvatarFallback className="bg-gray-200 text-gray-500 text-2xl">
                {(user.displayName || user.fullname!)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            {/* Online Status Indicator */}
            {/* TODO */}
            {/* <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                user.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}>
            </div> */}
          </div>

          <h1 className="text-xl font-semibold mb-1">
            {user.displayName || user.fullname}
          </h1>
          <p className="text-gray-600 mb-1">
            {user.department || "Computer Engineering"}
          </p>
          <p className="text-gray-600 mb-2">{user.matricNumber || "2023"}</p>

          {/* Last Seen */}
          <p className="text-xs text-gray-500 mb-6">
            {false
              ? "Online now"
              : `Last seen ${formatLastSeen(user.lastSeen!)}`}
          </p>

          {/* Action Buttons */}
          <UserActions
            userId={user.id}
            userName={user.displayName! || user.fullname!}
          />
        </div>

        {/* Details Section */}
        <UserDetailsCard user={user} />
      </div>
    </div>
  );
}

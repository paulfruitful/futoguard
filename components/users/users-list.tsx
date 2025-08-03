"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "./empty-state";
import { UserCardSkeleton } from "./user-card-skeleton";

interface User {
  id: string;
  fullname: string;
  department: string;
  year: string;
  faculty: string;
  phone: string;
  registeredLocation: { lat: number; lng: number } | null;
  displayName?: string;
  passport?: string;
  displayPicture?: string;
  displayMobileNumber?: string;
  avatar?: string;
}

interface UsersListProps {
  users: User[];
  isLoading: boolean;
  activeTab: string;
  searchQuery: string;
}

export function UsersList({
  users,
  isLoading,
  activeTab,
  searchQuery,
}: UsersListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    if (searchQuery) {
      return (
        <EmptyState
          type="no-search-results"
          title="No Users Found"
          description={`No users found matching "${searchQuery}"`}
        />
      );
    }

    return (
      <EmptyState
        type="no-users"
        title="No Users Available"
        description="There are no users to display at the moment."
      />
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          showNearbyIndicator={activeTab !== "all"}
        />
      ))}
    </div>
  );
}

interface UserCardProps {
  user: User;
  showNearbyIndicator: boolean;
}

function UserCard({ user, showNearbyIndicator }: UserCardProps) {
  return (
    <Link href={`/users/${user.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={user.displayPicture || user.passport || "/placeholder.svg"}
              />
              <AvatarFallback>
                {user.displayName ||
                  user.fullname
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">
                {user.displayName || user.fullname}
              </h3>
              <p className="text-sm text-gray-600">{user.department}</p>
              <p className="text-xs text-gray-500">{user.year}</p>
            </div>
            {showNearbyIndicator && (
              <div className="text-right">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-500 mt-1">Nearby</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

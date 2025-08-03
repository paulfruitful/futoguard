"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "./search-bar";
import { TabNavigation } from "./tab-navigation";
import { UsersList } from "./users-list";
import { LocationPermissionHandler } from "./location-permission-handler";
import { EmptyState } from "./empty-state";

interface User {
  id: string;
  name: string;
  department: string;
  year: string;
  faculty: string;
  phone: string;
  registeredLocation: { lat: number; lng: number } | null;
  avatar?: string;
}

interface UsersPageClientProps {
  initialUsers: User[];
}

type TabType = "all" | "suggested" | "realtime";

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);

  // Use TanStack Query for client-side data fetching
  const {
    data: users = initialUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", activeTab, searchQuery, currentLocation],
    queryFn: async () => {
      const params = new URLSearchParams({
        tab: activeTab,
        search: searchQuery,
        ...(currentLocation && {
          lat: currentLocation.lat.toString(),
          lng: currentLocation.lng.toString(),
        }),
      });

      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    enabled: !(activeTab === "realtime" && !currentLocation),
    initialData: initialUsers,
    staleTime: 5 * 60 * 1000,
  });

  const handleLocationUpdate = (
    location: { lat: number; lng: number } | null
  ) => {
    setCurrentLocation(location);
  };

  const handlePermissionUpdate = (
    permission: "granted" | "denied" | "prompt"
  ) => {
    setLocationPermission(permission);
  };

  // Show location permission handler for specific tabs
  if (activeTab === "suggested" && !hasRegisteredLocation()) {
    return (
      <div className="p-4">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <EmptyState
          type="no-registered-location"
          title="Location Not Registered"
          description="Please register your location in settings to see suggested users near you."
          actionText="Go to Settings"
          actionHref="/settings"
        />
      </div>
    );
  }

  if (activeTab === "realtime" && locationPermission !== "granted") {
    return (
      <div className="p-4">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <LocationPermissionHandler
          onLocationUpdate={handleLocationUpdate}
          onPermissionUpdate={handlePermissionUpdate}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 py-20">
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {error ? (
        <EmptyState
          type="error"
          title="Error Loading Users"
          description="There was an error loading the users. Please try again."
        />
      ) : (
        <UsersList
          users={users}
          isLoading={isLoading}
          activeTab={activeTab}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}

// Helper function to check if user has registered location
function hasRegisteredLocation(): boolean {
  // In a real app, this would check the current user's profile
  // For now, we'll assume they have registered location
  return true;
}

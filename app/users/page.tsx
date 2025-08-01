"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Settings } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import Link from "next/link";

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Uche Montana",
    department: "Computer Engineering",
    year: "2019",
    faculty: "School of Engineering and Engineering Technology",
    phone: "08163048772",
    registeredLocation: { lat: 5.3919, lng: 7.0219 }, // Owerri coordinates
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Chinaza Joy",
    department: "Chemical Engineering",
    year: "2020",
    faculty: "School of Engineering and Engineering Technology",
    phone: "08163048773",
    registeredLocation: { lat: 5.392, lng: 7.022 },
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "Brian Osuji",
    department: "Electrical Engineering",
    year: "2021",
    faculty: "School of Engineering and Engineering Technology",
    phone: "08163048774",
    registeredLocation: null, // No registered location
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 4,
    name: "Emmanuel Bright",
    department: "Mechanical Engineering",
    year: "2022",
    faculty: "School of Engineering and Engineering Technology",
    phone: "08163048775",
    registeredLocation: { lat: 5.3925, lng: 7.0225 },
    avatar: "/placeholder.svg?height=60&width=60",
  },
];

type TabType = "all" | "suggested" | "realtime";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);

  // Check location permission on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state);
      });
    }
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermission("granted");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationPermission("denied");
        }
      );
    }
  };

  // Calculate distance between two coordinates (simplified)
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter users based on active tab and search
  useEffect(() => {
    let users = mockUsers;

    // Apply tab filtering
    if (activeTab === "suggested") {
      users = users.filter((user) => user.registeredLocation !== null);
      // Sort by distance from user's registered location (mock: 5.3919, 7.0219)
      users.sort((a, b) => {
        if (!a.registeredLocation || !b.registeredLocation) return 0;
        const distA = calculateDistance(
          5.3919,
          7.0219,
          a.registeredLocation.lat,
          a.registeredLocation.lng
        );
        const distB = calculateDistance(
          5.3919,
          7.0219,
          b.registeredLocation.lat,
          b.registeredLocation.lng
        );
        return distA - distB;
      });
    } else if (activeTab === "realtime") {
      if (currentLocation) {
        users = users.filter((user) => user.registeredLocation !== null);
        users.sort((a, b) => {
          if (
            !a.registeredLocation ||
            !b.registeredLocation ||
            !currentLocation
          )
            return 0;
          const distA = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            a.registeredLocation.lat,
            a.registeredLocation.lng
          );
          const distB = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            b.registeredLocation.lat,
            b.registeredLocation.lng
          );
          return distA - distB;
        });
      }
    }

    // Apply search filtering
    if (searchQuery) {
      users = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(users);
  }, [activeTab, searchQuery, currentLocation]);

  const renderLocationMessage = () => {
    if (activeTab === "suggested") {
      return (
        <div className="text-center py-8 px-4">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Location Not Registered
          </h3>
          <p className="text-gray-600 mb-4">
            Please register your location in settings to see suggested users
            near you.
          </p>
          <Button asChild className="bg-red-500 hover:bg-red-600">
            <Link href="/settings">
              <Settings className="w-4 h-4 mr-2" />
              Go to Settings
            </Link>
          </Button>
        </div>
      );
    }

    if (activeTab === "realtime" && locationPermission !== "granted") {
      return (
        <div className="text-center py-8 px-4">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Location Permission Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please enable location services to see users near your current
            location.
          </p>
          <Button
            onClick={getCurrentLocation}
            className="bg-red-500 hover:bg-red-600"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Enable Location
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Users" />

      <div className="p-4 space-y-4 pt-20">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            onClick={() => setActiveTab("all")}
            className="flex-1 h-10"
          >
            All Users
          </Button>
          <Button
            variant={activeTab === "suggested" ? "default" : "ghost"}
            onClick={() => setActiveTab("suggested")}
            className="flex-1 h-10"
          >
            Suggested
          </Button>
          <Button
            variant={activeTab === "realtime" ? "default" : "ghost"}
            onClick={() => setActiveTab("realtime")}
            className="flex-1 h-10"
          >
            Realtime
          </Button>
        </div>

        {/* Content */}
        {renderLocationMessage() || (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Link key={user.id} href={`/users/${user.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-gray-600">
                            {user.department}
                          </p>
                          <p className="text-xs text-gray-500">{user.year}</p>
                        </div>
                        {activeTab !== "all" && (
                          <div className="text-right">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-xs text-gray-500 mt-1">Nearby</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationPermissionHandlerProps {
  onLocationUpdate: (location: { lat: number; lng: number } | null) => void;
  onPermissionUpdate: (permission: "granted" | "denied" | "prompt") => void;
}

export function LocationPermissionHandler({
  onLocationUpdate,
  onPermissionUpdate,
}: LocationPermissionHandlerProps) {
  useEffect(() => {
    // Check initial permission state
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        onPermissionUpdate(result.state as "granted" | "denied" | "prompt");

        if (result.state === "granted") {
          getCurrentLocation();
        }
      });
    }
  }, [onLocationUpdate, onPermissionUpdate]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          onLocationUpdate(location);
          onPermissionUpdate("granted");
        },
        (error) => {
          console.error("Error getting location:", error);
          onPermissionUpdate("denied");
          onLocationUpdate(null);
        }
      );
    }
  };

  return (
    <div className="text-center py-8 px-4">
      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Location Permission Required
      </h3>
      <p className="text-gray-600 mb-4">
        Please enable location services to see users near your current location.
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

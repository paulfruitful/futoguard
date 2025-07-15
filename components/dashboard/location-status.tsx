"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { MapPin, RefreshCw } from "lucide-react"

export function LocationStatus() {
  const { location, setLocation } = useAppStore()

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          })
        },
        (error) => {
          console.error("Location error:", error)
        },
      )
    }
  }

  useEffect(() => {
    updateLocation()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Location Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {location.latitude && location.longitude ? (
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-600">Latitude:</p>
              <p className="font-mono">{location.latitude.toFixed(6)}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600">Longitude:</p>
              <p className="font-mono">{location.longitude.toFixed(6)}</p>
            </div>
            {location.accuracy && (
              <div className="text-sm">
                <p className="text-gray-600">Accuracy:</p>
                <p>{Math.round(location.accuracy)}m</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={updateLocation} className="w-full bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Location
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3">Location not available</p>
            <Button variant="outline" size="sm" onClick={updateLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              Enable Location
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

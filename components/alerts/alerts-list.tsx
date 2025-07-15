"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { AlertTriangle, MapPin, Clock, ExternalLink } from "lucide-react"

interface Alert {
  id: string
  latitude: number
  longitude: number
  urgencyScore: number
  status: string
  createdAt: string
  user?: {
    name: string
  }
}

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  const getUrgencyColor = (score: number) => {
    if (score >= 0.8) return "destructive"
    if (score >= 0.6) return "default"
    return "secondary"
  }

  const getUrgencyLabel = (score: number) => {
    if (score >= 0.8) return "Critical"
    if (score >= 0.6) return "High"
    if (score >= 0.4) return "Medium"
    return "Low"
  }

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle
                className={`h-5 w-5 mt-0.5 ${
                  alert.urgencyScore >= 0.8
                    ? "text-red-600"
                    : alert.urgencyScore >= 0.6
                      ? "text-orange-600"
                      : "text-yellow-600"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold">Alert #{alert.id.slice(-8)}</h3>
                  <Badge variant={getUrgencyColor(alert.urgencyScore)}>{getUrgencyLabel(alert.urgencyScore)}</Badge>
                  <Badge variant="outline">{alert.status}</Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">From:</span>
                    <span>{alert.user?.name || "Anonymous User"}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => openInMaps(alert.latitude, alert.longitude)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{Math.round(alert.urgencyScore * 100)}%</div>
              <div className="text-xs text-gray-500">Urgency</div>
            </div>
          </div>
        </div>
      ))}

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No alerts found</p>
        </div>
      )}
    </div>
  )
}

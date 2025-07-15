import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { AlertTriangle, MapPin, Clock } from "lucide-react"

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

interface RecentAlertsProps {
  alerts: Alert[]
  title: string
}

export function RecentAlerts({ alerts, title }: RecentAlertsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent alerts</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      alert.urgencyScore >= 0.8
                        ? "text-red-600"
                        : alert.urgencyScore >= 0.6
                          ? "text-orange-600"
                          : "text-yellow-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{alert.user?.name || "Anonymous User"}</p>
                    <Badge variant={getUrgencyColor(alert.urgencyScore)}>{getUrgencyLabel(alert.urgencyScore)}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {alert.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

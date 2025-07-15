import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Phone, Users, MapPin } from "lucide-react"

export function EmergencyInstructions() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>What Happens When You Press SOS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start space-x-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <strong>Location Captured:</strong> Your GPS coordinates are automatically recorded
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <strong>Audio Recording:</strong> 30-second audio clip is recorded for context
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <strong>AI Analysis:</strong> Threat level is assessed automatically
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <strong>Instant Alerts:</strong> Nearby users and security are notified immediately
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold">Nearby Users</h4>
            <p className="text-sm text-gray-600">Within 100m radius</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold">Campus Security</h4>
            <p className="text-sm text-gray-600">Immediate notification</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold">Emergency Services</h4>
            <p className="text-sm text-gray-600">If high urgency detected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

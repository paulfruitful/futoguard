import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, MapPin, FileText, Users } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button asChild variant="destructive" className="h-20 flex-col space-y-2">
            <Link href="/sos">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm">Emergency SOS</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
            <Link href="/alerts">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">View Alerts</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
            <Link href="/report">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Report Issue</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
            <Link href="/nearby">
              <Users className="h-6 w-6" />
              <span className="text-sm">Nearby Users</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

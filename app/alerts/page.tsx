import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, MapPin, Clock } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
// import { BottomNavigation } from "@/components/bottom-navigation"

const alerts = [
  {
    id: 1,
    user: {
      name: "Brian Osuji",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    message: "Alert sent out to emergency contacts",
    location: "Esioboro",
    time: "8:00 pm",
    status: "active",
  },
  // Add more alerts as needed
];

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Alerts" />

      <div className="p-4 space-y-4 pt-20">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
            <p className="text-gray-600">
              You have no active alerts at the moment
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="relative">
              <CardContent className="p-4">
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="flex items-start space-x-3">
                  {/* User Avatar */}
                  <Avatar className="w-12 h-12 mt-1">
                    <AvatarImage
                      src={alert.user.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {alert.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {alert.user.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {alert.message}
                    </p>

                    {/* Location and Time */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{alert.time}</span>
                      </div>
                    </div>

                    {/* Respond Button */}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 px-6"
                      >
                        Respond
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

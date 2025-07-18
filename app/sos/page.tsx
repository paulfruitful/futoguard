import { redirect } from "next/navigation";
import { SOSButton } from "@/components/sos/sos-button";
import { EmergencyInstructions } from "@/components/sos/emergency-instructions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export default async function SOSPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-gray-900"
          >
            ←
          </Link>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Emergency Mode</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Emergency Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Emergency Alert
            </h1>
            <p className="text-gray-600">
              Press the button below if you need immediate assistance
            </p>
          </div>

          {/* SOS Button */}
          <div className="flex justify-center">
            <SOSButton userId={session.user.id} />
          </div>

          {/* Emergency Instructions */}
          <EmergencyInstructions />

          {/* Quick Contact Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <Phone className="h-5 w-5" />
                  <span>Campus Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">+234-XXX-XXXX</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  Call Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <MapPin className="h-5 w-5" />
                  <span>Emergency Assembly</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Main Quadrangle</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Safety Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">
                Safety Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <ul className="space-y-2 text-sm">
                <li>• Stay calm and move to a safe location if possible</li>
                <li>• Keep your phone charged and accessible</li>
                <li>• Follow instructions from security personnel</li>
                <li>• Do not use elevators during emergencies</li>
                <li>• Help others if you can do so safely</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, FileText } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { SideNav } from "@/components/SidebarNav";

export default async function DashboardPage() {
  const session = await auth();

  // console.log("session", session);
  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch user's recent alerts
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <StatusBar /> */}
      <MobileHeader title="Dashboard" />

      <div className="p-4 pt-20 space-y-6">
        {/* Alert Statistics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                Hello, {session.user?.username}
              </h3>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Total Alerts</h3>
                <AlertTriangle className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-3xl font-bold mb-1">3</div>
              <p className="text-sm text-gray-600">
                campus wide incidents recorded
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Active Alerts</h4>
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-red-500 mb-1">2</div>
                <p className="text-xs text-gray-600">Requiring Attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">My Alerts</h4>
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold mb-1">0</div>
                <p className="text-xs text-gray-600">My submissions</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white hover:bg-red-50"
              asChild
            >
              <a href="/sos">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-sm">📞</span>
                </div>
                <span className="text-sm font-medium">Emergency SOS</span>
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white hover:bg-gray-50"
              asChild
            >
              <a href="/alerts">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium">View Alerts</span>
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white hover:bg-gray-50"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-sm font-medium">Report Issue</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 bg-white hover:bg-gray-50"
              asChild
            >
              <a href="/contacts">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium">Contacts</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

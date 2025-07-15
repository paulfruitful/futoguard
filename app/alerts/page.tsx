import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AlertsMap } from "@/components/alerts/alerts-map"
import { AlertsList } from "@/components/alerts/alerts-list"
import { AlertsFilters } from "@/components/alerts/alerts-filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function AlertsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch recent alerts
  const alerts = await prisma.alert.findMany({
    include: {
      user: {
        select: { name: true, id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  // Filter alerts based on user role
  const visibleAlerts =
    session.user.role === "ADMIN"
      ? alerts
      : alerts.filter(
          (alert) => alert.userId === session.user.id || alert.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours for others
        )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Campus Alerts</h1>
            </div>
            <AlertsFilters />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts ({visibleAlerts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertsList alerts={visibleAlerts} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Locations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <AlertsMap alerts={visibleAlerts} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

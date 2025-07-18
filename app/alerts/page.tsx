import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertsMap } from "@/components/alerts/alerts-map";
import { AlertsList } from "@/components/alerts/alerts-list";
import { AlertsFilters } from "@/components/alerts/alerts-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { auth } from "@/auth";

export default async function AlertsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch recent alerts
  // const alerts = await prisma.alert.findMany({
  //   include: {
  //     user: {
  //       select: { name: true, id: true },
  //     },
  //   },
  //   orderBy: { createdAt: "desc" },
  //   take: 50,
  // });

  const alerts = [
    {
      id: "alert_001",
      userId: "user_01",
      latitude: 5.3841,
      longitude: 6.9984,
      audioUrl: "https://example.com/audio/alert1.mp3",
      audioTranscript: "Help! I'm being followed.",
      urgencyScore: 0.92,
      aiAnalysis: "High stress in voice, background sounds suggest crowd.",
      status: "ACTIVE",
      blockchainTxId: "0xabc123txid001",
      createdAt: "2025-07-12T10:00:00.000Z",
      updatedAt: "2025-07-12T10:00:30.000Z",
    },
    {
      id: "alert_002",
      userId: "2F1E2495-01A3-4474-BDA0-CE51A7263ACE",
      latitude: 5.386,
      longitude: 6.9975,
      audioUrl: "https://example.com/audio/alert2.mp3",
      audioTranscript: "There’s someone suspicious near Hall 3.",
      urgencyScore: 0.75,
      aiAnalysis: "Moderate risk, tone indicates caution but no panic.",
      status: "ACTIVE",
      blockchainTxId: "0xabc123txid002",
      createdAt: "2025-07-12T10:02:00.000Z",
      updatedAt: "2025-07-12T10:02:20.000Z",
    },
    {
      id: "alert_003",
      userId: "user_03",
      latitude: 5.3825,
      longitude: 6.9942,
      audioUrl: "https://example.com/audio/alert3.mp3",
      audioTranscript: "Fight broke out near the school gate.",
      urgencyScore: 0.85,
      aiAnalysis: "Raised voices and crowd detected, probable conflict.",
      status: "RESOLVED",
      blockchainTxId: "0xabc123txid003",
      createdAt: "2025-07-12T09:58:00.000Z",
      updatedAt: "2025-07-12T10:03:00.000Z",
    },
    {
      id: "alert_004",
      userId: "user_04",
      latitude: 5.385,
      longitude: 6.996,
      audioUrl: "https://example.com/audio/alert4.mp3",
      audioTranscript: "My bag was just snatched at Hostel A!",
      urgencyScore: 0.88,
      aiAnalysis: "High alert: panic in voice and sudden movements.",
      status: "ACTIVE",
      blockchainTxId: "0xabc123txid004",
      createdAt: "2025-07-12T10:05:00.000Z",
      updatedAt: "2025-07-12T10:05:15.000Z",
    },
    {
      id: "alert_005",
      userId: "2F1E2495-01A3-4474-BDA0-CE51A7263ACE",
      latitude: 5.3811,
      longitude: 6.9955,
      audioUrl: "https://example.com/audio/alert5.mp3",
      audioTranscript: "I’m injured and need help at the lab.",
      urgencyScore: 0.95,
      aiAnalysis: "Critical: pain and urgency detected in speech.",
      status: "ACTIVE",
      blockchainTxId: "0xabc123txid005",
      createdAt: "2025-07-12T10:07:00.000Z",
      updatedAt: "2025-07-12T10:07:25.000Z",
    },
  ];

  // Filter alerts based on user role
  const visibleAlerts =
    session.user.role === "ADMIN"
      ? alerts
      : alerts.filter(
          (alert) =>
            alert.userId === session.user.id ||
            alert.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours for others
        );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Campus Alerts
          </h1>
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ←
              </Link>
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
  );
}

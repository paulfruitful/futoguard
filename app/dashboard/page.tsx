import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { LocationStatus } from "@/components/dashboard/location-status";
import { StatsCards } from "@/components/dashboard/stats-cards";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }
  console.log("session", session);

  // Fetch user's recent alerts
  const userAlerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch nearby recent alerts (within last 24 hours)
  const nearbyAlerts = await prisma.alert.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Get stats
  const totalAlerts = await prisma.alert.count();
  const activeAlerts = await prisma.alert.count({
    where: { status: "ACTIVE" },
  });
  const userAlertCount = await prisma.alert.count({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <StatsCards
              totalAlerts={totalAlerts}
              activeAlerts={activeAlerts}
              userAlerts={userAlertCount}
            />
            <QuickActions />
            <RecentAlerts alerts={nearbyAlerts} title="Recent Campus Alerts" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LocationStatus />
            <RecentAlerts alerts={userAlerts} title="My Recent Alerts" />
          </div>
        </div>
      </main>
    </div>
  );
}

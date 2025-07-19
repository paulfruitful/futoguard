import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminHeader } from "@/components/admin/admin-header";
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch comprehensive admin data
  const [alerts, reports, users, recentActivity] = await Promise.all([
    prisma.alert.findMany({
      include: {
        user: {
          select: { name: true, email: true, studentId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        department: true,
        createdAt: true,
        _count: {
          select: { alerts: true, reports: true },
        },
      },
    }),
    prisma.alert.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const stats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a) => a.status === "ACTIVE").length,
    totalReports: reports.length,
    totalUsers: users.length,
    highUrgencyAlerts: alerts.filter((a) => a.urgencyScore > 0.7).length,
    resolvedAlerts: alerts.filter((a) => a.status === "RESOLVED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={session.user} />

      <main className="container mx-auto px-4 py-6">
        <AdminDashboard
          alerts={alerts}
          reports={reports}
          users={users}
          recentActivity={recentActivity}
          stats={stats}
        />
      </main>
    </div>
  );
}

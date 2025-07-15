"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, FileText, TrendingUp, Download } from "lucide-react"
import { ResponsiveContainer, LineChart } from "recharts"

interface AdminDashboardProps {
  alerts: any[]
  reports: any[]
  users: any[]
  recentActivity: any[]
  stats: {
    totalAlerts: number
    activeAlerts: number
    totalReports: number
    totalUsers: number
    highUrgencyAlerts: number
    resolvedAlerts: number
  }
}

export function AdminDashboard({ alerts, reports, users, recentActivity, stats }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Prepare chart data
  const alertsByDay = alerts.reduce((acc: any, alert) => {
    const date = new Date(alert.createdAt).toLocaleDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(alertsByDay).map(([date, count]) => ({
    date,
    alerts: count
  })).slice(-7) // Last 7 days

  const urgencyDistribution = [
    { name: 'Critical', value: alerts.filter(a => a.urgencyScore >= 0.8).length, color: '#dc2626' },
    { name: 'High', value: alerts.filter(a => a.urgencyScore >= 0.6 && a.urgencyScore < 0.8).length, color: '#ea580c' },
    { name: 'Medium', value: alerts.filter(a => a.urgencyScore >= 0.4 && a.urgencyScore < 0.6).length, color: '#ca8a04' },
    { name: 'Low', value: alerts.filter(a => a.urgencyScore < 0.4).length, color: '#16a34a' }
  ]

  const exportData = () => {
    const data = {
      alerts,
      reports,
      users: users.map(u => ({ ...u, _count: undefined })), // Remove sensitive data
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `futo-guardian-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAlerts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highUrgencyAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Urgency ≥ 70%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Anonymous submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Trends (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <Cartes\

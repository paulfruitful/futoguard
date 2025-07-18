"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Users, FileText, TrendingUp, Download, MapPin, Clock, Volume2, Brain, Shield, Filter } from "lucide-react"
import { format } from "date-fns"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface Alert {
  id: string
  userId: string
  latitude: number
  longitude: number
  audioTranscript: string
  audioUrl?: string
  urgencyScore: number
  aiAnalysis: string
  status: string
  blockchainTxId?: string
  createdAt: string
  user: {
    name: string
  }
}

interface Report {
  id: string
  userId: string
  latitude: number
  longitude: number
  description: string
  category: string
  severity: string
  status: string
  aiAnalysis?: string
  blockchainTxId?: string
  createdAt: string
}

type FilterType = 'all' | 'high-risk' | 'blockchain' | 'recent'
type SeverityFilter = 'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export function AdminDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [filter, setFilter] = useState<FilterType>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast() 

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch alerts
      const alertsResponse = await fetch('/api/alert')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts || [])
      }
      
      // Fetch reports
      const reportsResponse = await fetch('/api/report')
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
  
  // Calculate stats for dashboard
  const stats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => a.status === 'ACTIVE').length,
    highUrgencyAlerts: alerts.filter(a => a.urgencyScore >= 0.7).length,
    totalReports: reports.length,
    totalUsers: 0 // Will be updated when user data is available
  }

  const exportData = () => {
    const data = {
      alerts,
      reports,
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="alerts" stroke="#3b82f6" activeDot={{ r: 8 }} />

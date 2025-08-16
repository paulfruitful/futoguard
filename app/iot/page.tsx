"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Settings, 
  Smartphone, 
  Users, 
  Wifi,
  WifiOff,
  Volume2,
  Battery,
  Signal
} from "lucide-react"

interface IoTAlert {
  id: string
  location: { latitude: number; longitude: number }
  priority: 'low' | 'medium' | 'high'
  status: string
  createdAt: string
  aiAnalysis: {
    confidence: number
    alertType: string
    deviceId: string
    detectionMethod: string
  }
  metadata: {
    deviceId: string
    isIoTGenerated: boolean
  }
  user: {
    id: string
    name: string
    email: string
  }
}

interface IoTDevice {
  id: string
  name: string
  location: string
  status: 'online' | 'offline'
  lastPing: string
  batteryLevel: number
  signalStrength: number
}

interface IoTStats {
  low: number
  medium: number
  high: number
}

export default function IoTDashboard() {
  const { data: session } = useSession()
  const [alerts, setAlerts] = useState<IoTAlert[]>([])
  const [devices, setDevices] = useState<IoTDevice[]>([])
  const [stats, setStats] = useState<IoTStats>({ low: 0, medium: 0, high: 0 })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchIoTData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchIoTData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchIoTData = async () => {
    try {
      const response = await fetch('/api/iot')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
        setDevices(data.devices || [])
        setStats(data.deviceStats || { low: 0, medium: 0, high: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch IoT data:', error)
      toast({
        title: "Error",
        description: "Failed to load IoT dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmergencyDetected = async (emergencyData: {
    location: { latitude: number; longitude: number }
    confidence: number
    audioAnalysis: any
  }) => {
    try {
      const response = await fetch('/api/iot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: 'browser_device',
          location: emergencyData.location,
          audioAnalysis: emergencyData.audioAnalysis,
          confidence: emergencyData.confidence,
          alertType: 'BROWSER_SOUND_TRIGGER',
          metadata: {
            source: 'browser',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Emergency Alert Sent",
          description: `Alert ${result.alertId} created with ${result.priority} priority`,
          variant: "destructive"
        })
        
        // Refresh data to show new alert
        fetchIoTData()
      }
    } catch (error) {
      console.error('Failed to send emergency alert:', error)
      toast({
        title: "Error",
        description: "Failed to send emergency alert",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'online' ? (
      <Wifi className="h-4 w-4 text-green-500" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" />
    )
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600'
    if (level > 20) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IoT Emergency System</h1>
          <p className="text-muted-foreground">
            AI-powered sound detection and emergency response network
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {devices.filter(d => d.status === 'online').length} / {devices.length} Online
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.high || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium Priority</p>
                <p className="text-2xl font-bold text-orange-600">{stats.medium || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online Devices</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sound-trigger" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sound-trigger">Sound Trigger System</TabsTrigger>
          <TabsTrigger value="devices">Device Management</TabsTrigger>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="sound-trigger">
          <SoundTrigger onEmergencyDetected={handleEmergencyDetected} />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IoT Device Network</CardTitle>
              <CardDescription>
                Monitor and manage connected emergency detection devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(device.status)}
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {device.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Battery className={`h-4 w-4 ${getBatteryColor(device.batteryLevel)}`} />
                          <span className={`text-sm font-medium ${getBatteryColor(device.batteryLevel)}`}>
                            {device.batteryLevel}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Battery</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Signal className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{device.signalStrength}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Signal</p>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                          {device.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(device.lastPing).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent IoT Alerts</CardTitle>
              <CardDescription>
                Emergency alerts detected by the IoT sound monitoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No IoT alerts detected yet</p>
                    <p className="text-sm">The system is monitoring for emergency sounds</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.priority === 'high' ? 'text-red-500' :
                          alert.priority === 'medium' ? 'text-orange-500' : 'text-green-500'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {alert.aiAnalysis.alertType.replace('_', ' ')}
                            </h3>
                            <Badge className={getPriorityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Device: {alert.metadata.deviceId} • 
                            Confidence: {Math.round(alert.aiAnalysis.confidence * 100)}% • 
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium">{alert.user.name}</p>
                        <p className="text-xs text-muted-foreground">{alert.user.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
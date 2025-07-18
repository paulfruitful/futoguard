"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Volume2, VolumeX, Wifi, WifiOff, AlertTriangle, Users, Settings } from "lucide-react"
import { teachableMachineAudio } from "@/src/AI/teachablemodel"
import { AudioHandler } from "@/src/AI/audiohandler"

interface IoTDevice {
  id: string
  name: string
  location: string
  status: 'online' | 'offline'
  lastPing: string
}

interface SoundTriggerProps {
  onEmergencyDetected?: (data: {
    location: { latitude: number; longitude: number }
    confidence: number
    audioAnalysis: any
  }) => void
}

export function SoundTrigger({ onEmergencyDetected }: SoundTriggerProps) {
  const [isListening, setIsListening] = useState(false)
  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const [sensitivity, setSensitivity] = useState([70])
  const [volume, setVolume] = useState([80])
  const [connectedDevices, setConnectedDevices] = useState<IoTDevice[]>([])
  const [emergencyMode, setEmergencyMode] = useState(false)
  const { toast } = useToast()
  
  const audioHandlerRef = useRef<AudioHandler | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null)
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize audio context and alarm sound
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      alarmSoundRef.current = new Audio()
      alarmSoundRef.current.loop = true
      
      // Generate alarm sound using Web Audio API
      generateAlarmSound()
    }
    
    // Simulate IoT devices
    setConnectedDevices([
      { id: '1', name: 'Library Sensor', location: 'Main Library', status: 'online', lastPing: new Date().toISOString() },
      { id: '2', name: 'Cafeteria Sensor', location: 'Student Cafeteria', status: 'online', lastPing: new Date().toISOString() },
      { id: '3', name: 'Parking Sensor', location: 'Parking Lot A', status: 'offline', lastPing: new Date(Date.now() - 300000).toISOString() }
    ])

    return () => {
      stopListening()
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current)
      }
    }
  }, [])

  const generateAlarmSound = () => {
    if (!audioContextRef.current) return
    
    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    // Create siren-like sound
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.5)
    oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 1)
    
    gainNode.gain.setValueAtTime(0, context.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume[0] / 100, context.currentTime + 0.1)
    
    return { oscillator, gainNode }
  }

  const startListening = async () => {
    try {
      if (!audioHandlerRef.current) {
        audioHandlerRef.current = new AudioHandler()
      }
      
      await audioHandlerRef.current.initialize()
      await teachableMachineAudio.loadModel()
      
      setIsListening(true)
      
      // Start continuous monitoring
      monitoringIntervalRef.current = setInterval(async () => {
        if (audioHandlerRef.current) {
          try {
            // Get real-time audio data
            const audioData = await audioHandlerRef.current.getRealTimeAudioData()
            const volumeLevel = audioHandlerRef.current.analyzeVolume(audioData)
            
            // Analyze with teachable machine
            const classifications = await teachableMachineAudio.classifyAudio(audioData)
            const emotionAnalysis = teachableMachineAudio.analyzeEmotionFromAudio(classifications)
            
            // Check for emergency sounds based on sensitivity
            const emergencyKeywords = ['scream', 'help', 'emergency', 'danger', 'attack', 'fire']
            const hasEmergencySound = classifications.some(c => 
              emergencyKeywords.some(keyword => 
                c.className.toLowerCase().includes(keyword) && 
                c.probability * 100 >= sensitivity[0]
              )
            )
            
            // Check for high stress emotions
            const stressEmotions = ['fear', 'panic', 'distress', 'anger']
            const hasStressEmotion = stressEmotions.includes(emotionAnalysis.emotion.toLowerCase()) && 
                                   emotionAnalysis.confidence >= sensitivity[0] / 100
            
            // Trigger alarm if emergency detected
            if ((hasEmergencySound || hasStressEmotion || volumeLevel > 0.8) && !emergencyMode) {
              await triggerEmergencyAlarm({
                classifications,
                emotionAnalysis,
                volumeLevel,
                confidence: Math.max(
                  ...classifications.filter(c => emergencyKeywords.some(k => c.className.toLowerCase().includes(k))).map(c => c.probability),
                  emotionAnalysis.confidence
                )
              })
            }
          } catch (error) {
            console.error('Audio monitoring error:', error)
          }
        }
      }, 2000) // Check every 2 seconds
      
      toast({
        title: "Sound Monitoring Active",
        description: "IoT system is now listening for emergency sounds"
      })
    } catch (error) {
      console.error('Failed to start listening:', error)
      toast({
        title: "Error",
        description: "Failed to start sound monitoring",
        variant: "destructive"
      })
    }
  }

  const stopListening = () => {
    setIsListening(false)
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current)
    }
    
    if (audioHandlerRef.current) {
      audioHandlerRef.current.cleanup()
    }
    
    toast({
      title: "Sound Monitoring Stopped",
      description: "IoT system is no longer listening"
    })
  }

  const triggerEmergencyAlarm = async (audioAnalysis: any) => {
    setEmergencyMode(true)
    setIsAlarmActive(true)
    
    // Get current location
    const location = await getCurrentLocation()
    
    // Play alarm sound
    if (alarmSoundRef.current) {
      alarmSoundRef.current.volume = volume[0] / 100
      alarmSoundRef.current.play().catch(console.error)
    }
    
    // Trigger browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 EMERGENCY DETECTED', {
        body: `Emergency sound detected nearby. Confidence: ${Math.round(audioAnalysis.confidence * 100)}%`,
        icon: '/favicon.ico',
        requireInteraction: true
      })
    }
    
    // Notify parent component
    if (onEmergencyDetected) {
      onEmergencyDetected({
        location,
        confidence: audioAnalysis.confidence,
        audioAnalysis
      })
    }
    
    // Send to nearby devices (simulated)
    broadcastToNearbyDevices({
      type: 'EMERGENCY_ALERT',
      location,
      confidence: audioAnalysis.confidence,
      timestamp: new Date().toISOString()
    })
    
    toast({
      title: "🚨 EMERGENCY DETECTED",
      description: `Emergency sound detected with ${Math.round(audioAnalysis.confidence * 100)}% confidence`,
      variant: "destructive"
    })
    
    // Auto-stop alarm after 30 seconds
    setTimeout(() => {
      stopAlarm()
    }, 30000)
  }

  const stopAlarm = () => {
    setIsAlarmActive(false)
    setEmergencyMode(false)
    
    if (alarmSoundRef.current) {
      alarmSoundRef.current.pause()
      alarmSoundRef.current.currentTime = 0
    }
    
    toast({
      title: "Alarm Stopped",
      description: "Emergency alarm has been deactivated"
    })
  }

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Fallback to default campus location
          resolve({ latitude: 6.5244, longitude: 3.3792 }) // Lagos, Nigeria
        }
      )
    })
  }

  const broadcastToNearbyDevices = (alertData: any) => {
    // Simulate broadcasting to nearby IoT devices
    console.log('Broadcasting emergency alert to nearby devices:', alertData)
    
    // In a real implementation, this would:
    // 1. Send to WebSocket server
    // 2. Use WebRTC for peer-to-peer communication
    // 3. Send push notifications to nearby users
    // 4. Trigger physical IoT devices via MQTT/HTTP
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You will receive emergency alerts"
        })
      }
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div className="space-y-6">
      {/* Main Control Panel */}
      <Card className={`${emergencyMode ? 'border-red-500 bg-red-50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isListening ? (
              <Volume2 className="h-5 w-5 text-green-500" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-500" />
            )}
            IoT Sound Trigger System
            {emergencyMode && (
              <Badge variant="destructive" className="animate-pulse">
                EMERGENCY MODE
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            AI-powered sound detection system for campus emergency response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Status</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isListening}
                  onCheckedChange={isListening ? stopListening : startListening}
                  disabled={emergencyMode}
                />
                <span className={`text-sm ${isListening ? 'text-green-600' : 'text-gray-500'}`}>
                  {isListening ? 'Active Monitoring' : 'Inactive'}
                </span>
              </div>
            </div>
            
            {isAlarmActive && (
              <Button
                onClick={stopAlarm}
                variant="destructive"
                className="animate-pulse"
              >
                <VolumeX className="h-4 w-4 mr-2" />
                Stop Alarm
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sensitivity: {sensitivity[0]}%</label>
              <Slider
                value={sensitivity}
                onValueChange={setSensitivity}
                max={100}
                min={10}
                step={5}
                className="w-full"
                disabled={isListening}
              />
              <p className="text-xs text-muted-foreground">
                Higher sensitivity detects more sounds but may cause false alarms
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Alarm Volume: {volume[0]}%</label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Volume level for emergency alarm sound
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connected IoT Devices
          </CardTitle>
          <CardDescription>
            Network of sound sensors across campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {device.status === 'online' ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-muted-foreground">{device.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                    {device.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last ping: {new Date(device.lastPing).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <p>System continuously monitors audio from connected IoT devices and your device's microphone</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <p>AI analyzes sounds for emergency keywords, stress emotions, and unusual volume levels</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <p>When emergency is detected, alarm sounds and alerts are broadcast to nearby devices</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <p>Emergency services and campus security are automatically notified with location data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
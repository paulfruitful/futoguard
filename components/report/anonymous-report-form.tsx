"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Send, Loader2 } from "lucide-react"

export function AnonymousReportForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    severity: "MEDIUM",
  })
  const { toast } = useToast()

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          toast({
            title: "Location captured",
            description: "Your current location has been recorded.",
          })
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enter it manually.",
            variant: "destructive",
          })
        },
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location) {
      toast({
        title: "Location required",
        description: "Please capture your location or enter coordinates manually.",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description of the issue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...location,
          ...formData,
        }),
      })

      if (response.ok) {
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep the campus safe. Your report has been submitted anonymously.",
        })

        // Reset form
        setFormData({
          description: "",
          category: "",
          severity: "MEDIUM",
        })
        setLocation(null)
      } else {
        throw new Error("Failed to submit report")
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Unable to submit your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Section */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Location</Label>

        {location ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Location captured</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={getCurrentLocation} className="w-full bg-transparent">
            <MapPin className="h-4 w-4 mr-2" />
            Capture Current Location
          </Button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="safety">Safety Concern</SelectItem>
            <SelectItem value="security">Security Issue</SelectItem>
            <SelectItem value="infrastructure">Infrastructure Problem</SelectItem>
            <SelectItem value="lighting">Poor Lighting</SelectItem>
            <SelectItem value="suspicious">Suspicious Activity</SelectItem>
            <SelectItem value="harassment">Harassment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Severity */}
      <div className="space-y-2">
        <Label htmlFor="severity">Severity Level</Label>
        <Select
          value={formData.severity}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low - Minor concern</SelectItem>
            <SelectItem value="MEDIUM">Medium - Moderate issue</SelectItem>
            <SelectItem value="HIGH">High - Serious problem</SelectItem>
            <SelectItem value="CRITICAL">Critical - Immediate attention needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the safety concern or incident in detail. Include when it occurred, what you observed, and any other relevant information."
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={5}
          required
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting Report...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Anonymous Report
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        This report is completely anonymous. No personal information is collected or stored.
      </div>
    </form>
  )
}

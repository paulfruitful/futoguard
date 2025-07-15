"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

export function AlertsFilters() {
  const [urgency, setUrgency] = useState("all")
  const [status, setStatus] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filters:</span>
      </div>

      <Select value={urgency} onValueChange={setUrgency}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Urgency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Urgency</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="false_alarm">False Alarm</SelectItem>
        </SelectContent>
      </Select>

      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1h">Last Hour</SelectItem>
          <SelectItem value="24h">Last 24h</SelectItem>
          <SelectItem value="7d">Last Week</SelectItem>
          <SelectItem value="30d">Last Month</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm">
        Apply Filters
      </Button>
    </div>
  )
}

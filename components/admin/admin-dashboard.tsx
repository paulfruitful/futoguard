"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Users,
  FileText,
  TrendingUp,
  Download,
  MapPin,
  Clock,
  Volume2,
  Brain,
  Shield,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface Alert {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  audioTranscript: string;
  audioUrl?: string;
  urgencyScore: number;
  aiAnalysis: string;
  status: string;
  blockchainTxId?: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Report {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  description: string;
  category: string;
  severity: string;
  status: string;
  aiAnalysis?: string;
  blockchainTxId?: string;
  createdAt: string;
}

type FilterType = "all" | "high-risk" | "blockchain" | "recent";
type SeverityFilter = "all" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function AdminDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [filter, setFilter] = useState<FilterType>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch alerts
      const alertsResponse = await fetch("/api/alert");
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }

      // Fetch reports
      const reportsResponse = await fetch("/api/report");
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const alertsByDay = alerts.reduce((acc: any, alert) => {
    const date = new Date(alert.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(alertsByDay)
    .map(([date, count]) => ({
      date,
      alerts: count,
    }))
    .slice(-7); // Last 7 days

  const urgencyDistribution = [
    {
      name: "Critical",
      value: alerts.filter((a) => a.urgencyScore >= 0.8).length,
      color: "#dc2626",
    },
    {
      name: "High",
      value: alerts.filter((a) => a.urgencyScore >= 0.6 && a.urgencyScore < 0.8)
        .length,
      color: "#ea580c",
    },
    {
      name: "Medium",
      value: alerts.filter((a) => a.urgencyScore >= 0.4 && a.urgencyScore < 0.6)
        .length,
      color: "#ca8a04",
    },
    {
      name: "Low",
      value: alerts.filter((a) => a.urgencyScore < 0.4).length,
      color: "#16a34a",
    },
  ];

  // Calculate stats for dashboard
  const stats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a) => a.status === "ACTIVE").length,
    highUrgencyAlerts: alerts.filter((a) => a.urgencyScore >= 0.7).length,
    totalReports: reports.length,
    totalUsers: 0, // Will be updated when user data is available
  };

  const exportData = () => {
    const data = {
      alerts,
      reports,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `futo-guardian-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
  };

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
            <div className="text-2xl font-bold text-red-600">
              {stats.highUrgencyAlerts}
            </div>
            <p className="text-xs text-muted-foreground">Urgency ≥ 70%</p>
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
            <p className="text-xs text-muted-foreground">Registered users</p>
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
                    <Line
                      type="monotone"
                      dataKey="alerts"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Urgency Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Urgency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urgencyDistribution.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="h-4 w-4 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value} alerts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent High Priority Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent High Priority Alerts</CardTitle>
              <CardDescription>Alerts with urgency score ≥ 70%</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts
                .filter((a) => a.urgencyScore >= 0.7)
                .slice(0, 5)
                .map((alert) => (
                  <div key={alert.id} className="border-b py-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              alert.urgencyScore >= 0.8
                                ? "destructive"
                                : "warning"
                            }
                          >
                            {alert.urgencyScore >= 0.8 ? "CRITICAL" : "HIGH"}
                          </Badge>
                          <span className="font-medium">{alert.user.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {alert.audioTranscript}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          {alert.latitude.toFixed(4)},{" "}
                          {alert.longitude.toFixed(4)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {alerts.filter((a) => a.urgencyScore >= 0.7).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No high priority alerts found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Alerts</CardTitle>
                  <CardDescription>
                    All emergency alerts from users
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Select
                    value={filter}
                    onValueChange={(val) => setFilter(val as FilterType)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter alerts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="high-risk">High Risk</SelectItem>
                      <SelectItem value="blockchain">
                        Blockchain Verified
                      </SelectItem>
                      <SelectItem value="recent">Recent (24h)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[200px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts
                  .filter((alert) => {
                    if (filter === "high-risk")
                      return alert.urgencyScore >= 0.7;
                    if (filter === "blockchain") return alert.blockchainTxId;
                    if (filter === "recent") {
                      const alertDate = new Date(alert.createdAt);
                      const now = new Date();
                      return (
                        now.getTime() - alertDate.getTime() <
                        24 * 60 * 60 * 1000
                      );
                    }
                    return true;
                  })
                  .filter((alert) => {
                    if (!searchTerm) return true;
                    return (
                      alert.user.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      alert.audioTranscript
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      alert.id.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                  })
                  .map((alert) => (
                    <Card
                      key={alert.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  alert.urgencyScore >= 0.8
                                    ? "destructive"
                                    : alert.urgencyScore >= 0.6
                                    ? "warning"
                                    : "default"
                                }
                              >
                                Urgency: {Math.round(alert.urgencyScore * 100)}%
                              </Badge>
                              <Badge variant="outline">{alert.status}</Badge>
                              {alert.blockchainTxId && (
                                <Badge variant="secondary">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium">{alert.user.name}</h4>
                            <p className="text-sm">{alert.audioTranscript}</p>
                            <div className="flex space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {alert.latitude.toFixed(4)},{" "}
                                {alert.longitude.toFixed(4)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(
                                  new Date(alert.createdAt),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Volume2 className="h-4 w-4 mr-2" />
                              Audio
                            </Button>
                            <Button variant="outline" size="sm">
                              <Brain className="h-4 w-4 mr-2" />
                              AI Analysis
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {alerts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No alerts found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>
                    Community-submitted incident reports
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Select
                    value={severityFilter}
                    onValueChange={(val) =>
                      setSeverityFilter(val as SeverityFilter)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[200px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .filter((report) => {
                    if (severityFilter === "all") return true;
                    return report.severity === severityFilter;
                  })
                  .filter((report) => {
                    if (!searchTerm) return true;
                    return (
                      report.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      report.category
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      report.id.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                  })
                  .map((report) => (
                    <Card
                      key={report.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  report.severity === "CRITICAL"
                                    ? "destructive"
                                    : report.severity === "HIGH"
                                    ? "warning"
                                    : "default"
                                }
                              >
                                {report.severity}
                              </Badge>
                              <Badge variant="outline">{report.category}</Badge>
                              <Badge variant="outline">{report.status}</Badge>
                              {report.blockchainTxId && (
                                <Badge variant="secondary">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{report.description}</p>
                            <div className="flex space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {report.latitude.toFixed(4)},{" "}
                                {report.longitude.toFixed(4)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(
                                  new Date(report.createdAt),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Brain className="h-4 w-4 mr-2" />
                            AI Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {reports.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No reports found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage registered users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                User management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

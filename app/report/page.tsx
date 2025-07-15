import { AnonymousReportForm } from "@/components/report/anonymous-report-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, Lock } from "lucide-react"
import Link from "next/link"

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FUTO Guardian</span>
          </Link>
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Anonymous Report</h1>
            <p className="text-gray-600">Report unsafe areas or incidents anonymously to help keep the campus secure</p>
          </div>

          {/* Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Lock className="h-5 w-5" />
                <span>Your Privacy is Protected</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ul className="space-y-2 text-sm">
                <li>• Your identity remains completely anonymous</li>
                <li>• No personal information is collected or stored</li>
                <li>• Reports are used solely for campus safety improvement</li>
                <li>• Location data helps security focus on problem areas</li>
              </ul>
            </CardContent>
          </Card>

          {/* Report Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Anonymous Report</CardTitle>
              <CardDescription>Provide details about unsafe conditions or incidents you've observed</CardDescription>
            </CardHeader>
            <CardContent>
              <AnonymousReportForm />
            </CardContent>
          </Card>

          {/* Emergency Notice */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center text-red-700">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">For immediate emergencies, call campus security directly</p>
                <p className="text-2xl font-bold mt-2">+234-XXX-XXXX</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

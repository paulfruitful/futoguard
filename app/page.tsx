import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Smartphone, Brain, LinkIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">FUTO Guard</h1>
          </div>
          <div className="space-x-4">
            {/* <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button> */}
            <Button asChild>
              <Link href="/auth/signin">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Campus Safety, <span className="text-red-600">Reimagined</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              FUTO Guardian is an AI-powered, blockchain-backed emergency
              response platform that keeps your campus community safe through
              real-time alerts, intelligent threat analysis, and decentralized
              incident logging.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
                <Link href="/auth/signin">Join Guardian Network</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/report">Report Anonymously</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Advanced Security Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>One-Touch SOS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instant emergency alerts with GPS location and audio recording
                  sent to nearby users and security personnel.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>AI Threat Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced AI analyzes audio and context to classify threat
                  urgency and recommend appropriate response actions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <LinkIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Blockchain Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tamper-proof incident logging on blockchain ensures data
                  integrity and creates immutable emergency records.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Real-time Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instant notifications to nearby users, security teams, and
                  emergency responders within 100m radius.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How FUTO Guardian Works
          </h3>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Emergency Detection
                  </h4>
                  <p className="text-gray-600">
                    User presses SOS button or IoT sensors detect unusual
                    activity. GPS location and audio are captured automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">AI Analysis</h4>
                  <p className="text-gray-600">
                    Advanced AI analyzes audio transcript, location data, and
                    historical patterns to determine threat level and urgency.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Blockchain Logging
                  </h4>
                  <p className="text-gray-600">
                    Incident details are permanently recorded on blockchain for
                    tamper-proof evidence and audit trail.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Instant Response
                  </h4>
                  <p className="text-gray-600">
                    Real-time alerts sent to nearby users, campus security, and
                    emergency services based on threat assessment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">FUTO Guardian</span>
          </div>
          <p className="text-gray-400 mb-4">
            Protecting campus communities through advanced technology and
            real-time response.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

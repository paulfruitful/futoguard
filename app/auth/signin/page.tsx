import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/signin-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
// import { auth } from "@/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  // try {
  //   const users = await prisma.user.findMany();
  //   console.log("users", users);
  // } catch (error) {
  //   console.log("Error", error);
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-900"
          >
            <Shield className="h-8 w-8 text-red-600" />
            <span>FUTO Guardian</span>
          </Link>
          <p className="text-gray-600 mt-2">Secure campus emergency response</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Don't have an account? Sign up with your student credentials above.
          </p>
          {/* <Link
            href="/report"
            className="text-red-600 hover:underline mt-2 inline-block"
          >
            Report anonymously instead
          </Link> */}
        </div>
      </div>
    </div>
  );
}

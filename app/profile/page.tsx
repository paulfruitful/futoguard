import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Bell, Settings, LogOut, Shield } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { LogoutDialog } from "@/components/logout-dialog";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }
  const user = session.user;
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Profile" showBack />

      <div className="p-4 space-y-6 pt-20">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6 flex">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              {user?.image && (
                <img src={user.image} alt={user.name || "User Avatar"} />
              )}
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold mb-1">{user?.name}</h2>
              <p className="text-gray-600 mb-1">{user?.email}</p>
              <p className="text-gray-600 mb-4">{user?.mobileNumber}</p>
              <Link href={"/profile/edit"}>
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50 bg-transparent"
                >
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start h-12 px-4">
            <User className="w-5 h-5 mr-3" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start h-12 px-4">
            <Bell className="w-5 h-5 mr-3" />
            Notification
          </Button>
          <Button variant="ghost" className="w-full justify-start h-12 px-4">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
        </div>

        {/* Logout */}
        <div className="pt-8">
          <LogoutDialog>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-red-500"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Log Out
            </Button>
          </LogoutDialog>
        </div>
      </div>
    </div>
  );
}

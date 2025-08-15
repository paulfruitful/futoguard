"use client";

import { ArrowLeft, Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, LogOut, Settings, User, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { SideNav } from "./SidebarNav";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function MobileHeader({
  title,
  showBack = false,
  onBack,
}: MobileHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  // console.log("user", user);
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="fixed w-full  z-50 flex items-center justify-between p-4 bg-white border-b lg:hidden">
      <div className="flex items-center">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="mr-2">
            {/* <Menu className="w-5 h-5" /> */}
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {user?.image ? (
                  <img src={user.image} alt={user.name || "User Avatar"} />
                ) : (
                  <Shield className="h-8 w-8 text-gray-500" />
                )}
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user?.name || "name"}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user?.email || "No email provided"}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {user?.role === "ADMIN" ? "Administrator" : "Student"}
                </p>
              </div>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

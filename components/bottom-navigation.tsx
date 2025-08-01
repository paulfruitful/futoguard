"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Rss, AlertTriangle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Map", href: "/map", icon: Map },
  { name: "SOS", href: "/sos", icon: AlertTriangle, isEmergency: true },
  { name: "Feed", href: "/feeds", icon: Rss },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const isEmergency = item.isEmergency;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                isActive ? "text-red-500" : "text-gray-500",
                isEmergency && "relative"
              )}
            >
              {isEmergency ? (
                <div className="w-16 h-16 border-8 text-red-500 bg-white rounded-full flex items-center justify-center -mt-6 shadow-lg">
                  <item.icon className="w-6 h-6 text-red-500" />
                </div>
              ) : (
                <item.icon
                  className={cn("w-5 h-5", isActive && "text-red-500")}
                />
              )}
              {!isEmergency && (
                <span className={cn(isActive && "text-red-500")}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

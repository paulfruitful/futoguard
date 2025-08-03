"use client";

import { Button } from "@/components/ui/button";

type TabType = "all" | "suggested" | "realtime";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
      <Button
        variant={activeTab === "all" ? "default" : "ghost"}
        onClick={() => onTabChange("all")}
        className="flex-1 h-10"
      >
        All Users
      </Button>
      <Button
        variant={activeTab === "suggested" ? "default" : "ghost"}
        onClick={() => onTabChange("suggested")}
        className="flex-1 h-10"
      >
        Suggested
      </Button>
      <Button
        variant={activeTab === "realtime" ? "default" : "ghost"}
        onClick={() => onTabChange("realtime")}
        className="flex-1 h-10"
      >
        Realtime
      </Button>
    </div>
  );
}

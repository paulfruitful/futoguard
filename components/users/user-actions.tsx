"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  userName: string;
}

export function UserActions({ userId, userName }: UserActionsProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: userId,
        }),
      });

      if (response.ok) {
        toast.success(`Connection request sent to ${userName}`);
      } else {
        throw new Error("Failed to send connection request");
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Failed to send connection request");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = () => {
    // Navigate to chat or create new chat
    router.push(`/chats/new?userId=${userId}`);
  };

  return (
    <div className="flex space-x-3 justify-center">
      <Button
        className="bg-red-500 hover:bg-red-600 px-8"
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect"}
      </Button>
      <Button
        variant="outline"
        className="px-8 bg-transparent"
        onClick={handleMessage}
      >
        Message
      </Button>
    </div>
  );
}

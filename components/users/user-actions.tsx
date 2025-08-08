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
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userId,
        }),
      });

      if (response.ok) {
        toast.success(`Connection request sent to ${userName}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send connection request"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = async () => {
    setIsCreatingChat(true);
    try {
      // First, check if a chat already exists between the two users
      const response = await fetch(`/api/chats/find-or-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId: userId,
        }),
      });

      if (response.ok) {
        const { chatId, isNew } = await response.json();

        if (isNew) {
          toast.success(`New conversation started with ${userName}`);
        }

        // Navigate to the chat
        router.push(`/chats/${chatId}`);
      } else {
        console.log("response", response);
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create or find chat");
      }
    } catch (error) {
      console.error("Error creating/finding chat:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start conversation"
      );
    } finally {
      setIsCreatingChat(false);
    }
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
        disabled={isCreatingChat}
      >
        {isCreatingChat ? "Starting..." : "Message"}
      </Button>
    </div>
  );
}

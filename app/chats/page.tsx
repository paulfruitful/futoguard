"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import Link from "next/link";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "next-auth/react";

interface Chat {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", (data) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === data.chatId
            ? {
                ...chat,
                lastMessage: {
                  content: data.content,
                  createdAt: data.createdAt,
                  senderId: data.senderId,
                },
                unreadCount:
                  data.senderId !== getCurrentUserId()
                    ? chat.unreadCount + 1
                    : chat.unreadCount,
              }
            : chat
        )
      );
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      const data = await response.json();
      console.log("response = ", data);
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const { data: session } = useSession();
  const getCurrentUserId = () => {
    // In a real app, get this from auth context
    if (session?.user?.id) {
      return session.user.id;
    }
  };

  const filteredChats = chats?.filter((chat) =>
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader title="Chats" />
        <div className="p-4 pt-20">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Chats" />

      <div className="p-4 space-y-4 pt-20 pb-20">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white"
          />
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <Link key={chat.id} href={`/chats/${chat.id}`}>
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={chat.participant.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {chat.participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.participant.name}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage?.content || "No messages yet"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

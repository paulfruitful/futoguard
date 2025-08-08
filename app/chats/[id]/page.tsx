"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Reply, MoreVertical } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  replyToId?: string;
  replyTo?: Message;
  createdAt: string;
  sender: {
    id: string;
    fullname: string;
    displayName?: string;
    passport: string;
    displayPicture?: string;
  };
}

interface Chat {
  id: string;
  type: string;
  name: string;
  participant?: {
    id: string;
    fullname: string;
    displayName?: string;
    passport: string;
    displayPicture?: string;
    // isOnline: boolean;
    lastSeen: string;
  };
  participants: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      fullname: string;
      displayName?: string;
      passport: string;
      displayPicture?: string;
      // isOnline: boolean;
      lastSeen: string;
    };
  }>;
}

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const [chatId, setChatId] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);
  const socket = useSocket();

  useEffect(() => {
    const initializeChat = async () => {
      const resolvedParams = await params;
      setChatId(resolvedParams.id);
    };
    initializeChat();
  }, [params]);

  // Fetch chat details
  const {
    data: chat,
    isLoading: chatLoading,
    error: chatError,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chat");
      }
      return response.json();
    },
    enabled: !!chatId,
  });

  // Fetch messages
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
    enabled: !!chatId,
  });

  useEffect(() => {
    if (!socket || !chatId) return;

    // Join chat room
    socket.emit("join_chat", chatId);

    // Listen for new messages
    socket.on("new_message", (message: Message) => {
      if (message.chatId === chatId) {
        // You would typically update the messages using React Query here
        scrollToBottom();
      }
    });

    // Listen for typing indicators
    socket.on("user_typing", ({ userId, isTyping }) => {
      if (isTyping) {
        setTypingUsers((prev) => [
          ...prev.filter((id) => id !== userId),
          userId,
        ]);
      } else {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }
    });

    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("new_message");
      socket.off("user_typing");
    };
  }, [socket, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      content: newMessage,
      chatId,
      replyToId: replyingTo?.id,
    };

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const message = await response.json();
        socket.emit("send_message", message);
        setNewMessage("");
        setReplyingTo(null);
        stopTyping();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!socket) return;

    // Emit typing indicator
    socket.emit("typing", { chatId, isTyping: true });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const stopTyping = () => {
    if (socket) {
      socket.emit("typing", { chatId, isTyping: false });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentUserId = () => {
    // In a real app, get this from auth context
    return "current-user-id";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (chatLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">Loading chat...</div>
      </div>
    );
  }

  if (chatError || messagesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Error Loading Chat</h3>
            <p className="text-gray-600 mb-4">
              There was an error loading this conversation.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 p bg-white border-b">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={
                chat?.participant?.displayPicture ||
                chat?.participant?.passport ||
                "/placeholder.svg"
              }
            />
            <AvatarFallback>
              {chat?.displayname ||
                chat?.fullname
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") ||
                "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">
              {chat?.participant.displayName || chat?.participant.fullname}
            </h1>
            {typingUsers.length > 0 ? (
              <p className="text-xs text-green-500">typing...</p>
            ) : chat?.participant?.isOnline ? (
              <p className="text-xs text-green-500">online</p>
            ) : (
              <p className="text-xs text-gray-500">offline</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => {
          const isOwn = message.senderId === getCurrentUserId();
          return (
            <div
              key={message.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div className={cn("max-w-[80%] space-y-1")}>
                {message.replyTo && (
                  <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-2 mb-1">
                    <p className="font-medium">
                      {message.replyTo.sender.displayName ||
                        message.replyTo.sender.displayName}
                    </p>
                    <p className="truncate">{message.replyTo.content}</p>
                  </div>
                )}
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl relative group",
                    isOwn ? "bg-red-500 text-white" : "bg-white text-gray-900"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwn ? "text-red-100" : "text-gray-500"
                    )}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200"
                    onClick={() => setReplyingTo(message)}
                  >
                    <Reply className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                Replying to{" "}
                {replyingTo.sender.displayName || replyingTo.sender.fullname}
              </p>
              <p className="text-sm truncate">{replyingTo.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyingTo(null)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-red-500 hover:bg-red-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

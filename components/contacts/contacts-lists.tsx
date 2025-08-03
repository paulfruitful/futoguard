"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { ContactCardSkeleton } from "./contact-card-skeleton";

interface EmergencyContact {
  id: string;
  userId: string;
  contactId: string;
  createdAt: string;
  contact: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    email: string;
    isOnline: boolean;
    lastSeen: string;
  };
}

interface ContactsListProps {
  contacts: EmergencyContact[];
  isLoading: boolean;
  onRemoveContact: (contactId: string, contactName: string) => void;
  isRemoving: boolean;
}

export function ContactsList({
  contacts,
  isLoading,
  onRemoveContact,
  isRemoving,
}: ContactsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <ContactCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((emergencyContact) => (
        <ContactCard
          key={emergencyContact.id}
          emergencyContact={emergencyContact}
          onRemove={onRemoveContact}
          isRemoving={isRemoving}
        />
      ))}
    </div>
  );
}

interface ContactCardProps {
  emergencyContact: EmergencyContact;
  onRemove: (contactId: string, contactName: string) => void;
  isRemoving: boolean;
}

function ContactCard({
  emergencyContact,
  onRemove,
  isRemoving,
}: ContactCardProps) {
  const { contact } = emergencyContact;

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/users/${contact.id}`}
            className="flex items-center space-x-3 flex-1 min-w-0"
          >
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* Online Status Indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  contact.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {contact.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">{contact.phone}</p>
              <p className="text-xs text-gray-500">
                {contact.isOnline
                  ? "Online now"
                  : formatLastSeen(contact.lastSeen)}
              </p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(emergencyContact.id, contact.name)}
            disabled={isRemoving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format last seen time
function formatLastSeen(lastSeen: string): string {
  const date = new Date(lastSeen);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

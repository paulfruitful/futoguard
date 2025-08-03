"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddContactButton } from "./add-contact-button";
import { toast } from "sonner";
import { EmptyContactsState } from "./empty-contacts.state";
import { ContactsList } from "./contacts-lists";

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

interface ContactsPageClientProps {
  initialContacts: EmergencyContact[];
}

export function ContactsPageClient({
  initialContacts,
}: ContactsPageClientProps) {
  const queryClient = useQueryClient();

  // Use TanStack Query for client-side data management
  const {
    data: contacts = initialContacts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts");
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      return response.json();
    },
    initialData: initialContacts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for removing contacts
  const removeContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to remove contact");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toast.success("Contact removed successfully");
    },
    onError: (error) => {
      console.error("Error removing contact:", error);
      toast.error("Failed to remove contact");
    },
  });

  const handleRemoveContact = (contactId: string, contactName: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${contactName} from your emergency contacts?`
      )
    ) {
      removeContactMutation.mutate(contactId);
    }
  };

  if (error) {
    return (
      <div className="p-4 pt-20">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Contacts</h3>
          <p className="text-gray-600 mb-4">
            There was an error loading your emergency contacts.
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["emergency-contacts"],
              })
            }
            className="text-red-500 hover:text-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasContacts = contacts.length > 0;

  return (
    <div className="p-4 space-y-4 py-20">
      {!hasContacts ? (
        <EmptyContactsState />
      ) : (
        <ContactsList
          contacts={contacts}
          isLoading={isLoading}
          onRemoveContact={handleRemoveContact}
          isRemoving={removeContactMutation.isPending}
        />
      )}

      <AddContactButton />
    </div>
  );
}

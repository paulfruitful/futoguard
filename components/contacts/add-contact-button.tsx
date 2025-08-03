"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddContactButton() {
  const router = useRouter();

  const handleAddContact = () => {
    // Navigate to users page to select contacts
    router.push("/users?mode=select");
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAddContact}
        className="w-full bg-red-500 hover:bg-red-600 h-12"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add contacts
      </Button>
      <p className="text-center text-sm text-gray-600">The people you know</p>
    </div>
  );
}

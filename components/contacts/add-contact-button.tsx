"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";

export function AddContactButton() {
  const router = useRouter();

  const handleAddContact = () => {
    // Navigate to users page to select contacts
    router.push("/users?mode=select");
  };

  return (
    <div className="space-y-2">
      <Link href={"/users"}>
        <Card>
          <CardContent className="p-6 flex gap-4">
            <button className="w-12 bg-red-500 text-red-500 hover:bg-red-600 h-12 rounded-full flex items-center justify-center text-white">
              <Plus className="text-3xl text-center w-10 h-10 font-bold" />
            </button>
            <div className="flex flex-col mb-2">
              <h3 className="text-lg font-semibold">Add contacts</h3>
              <p className="text-xs">This should be someone you know !</p>
            </div>
          </CardContent>
        </Card>
      </Link>
      <p className="text-center text-sm text-gray-600">The people you know</p>
    </div>
  );
}

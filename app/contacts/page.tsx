import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2 } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import Image from "next/image";

const contacts = [
  { name: "Chinza Joy", phone: "08163048772" },
  { name: "Divine-favour williams", phone: "08163048772" },
  { name: "Brian Osuji", phone: "08163048772" },
  { name: "Emmanuel Bright", phone: "08163048772" },
];

export default function ContactsPage() {
  const hasContacts = contacts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Emergency Contacts" showBack />

      <div className="p-4 space-y-4 pt-20">
        {!hasContacts ? (
          // Empty State
          <div className="text-center py-12">
            <div className="w-48 h-48 mx-auto mb-6">
              <Image
                src="/placeholder.svg?height=192&width=192"
                alt="Emergency contacts illustration"
                width={192}
                height={192}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Emergency Contact List
            </h3>
            <p className="text-gray-600 mb-6">
              Your emergency contacts will appear here once added
            </p>
          </div>
        ) : (
          // Contacts List
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Contact Button */}
        <Card>
          <CardContent className="p-6 flex gap-4">
            <button className="w-12 bg-red-500 hover:bg-red-600 h-12 rounded-full flex items-center justify-center text-white">
              <Plus className="text-3xl text-center w-10 h-10 font-bold" />
            </button>
            <div className="flex flex-col mb-2">
              <h3 className="text-lg font-semibold">Add contacts</h3>
              <p className="text-xs">This should be someone you know !</p>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-gray-600">The people you know</p>
      </div>

      {/* Bottom Navigation */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">⚠️</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}

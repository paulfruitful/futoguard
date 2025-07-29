"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LogoutDialogProps {
  children: React.ReactNode;
}

export function LogoutDialog({ children }: LogoutDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarImage src="/placeholder.svg?height=64&width=64" />
            <AvatarFallback>OC</AvatarFallback>
          </Avatar>
          <DialogTitle>Okechukwu James Chidi</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            jamesokechukwu33@gmail.com
            <br />
            +2348164692
          </DialogDescription>
          <Button
            variant="outline"
            className="text-red-500 border-red-500 hover:bg-red-50 mt-4 bg-transparent"
          >
            Edit Profile
          </Button>
        </DialogHeader>

        <div className="text-center py-4">
          <h3 className="text-lg font-semibold mb-2">Are You Sure?</h3>
          <p className="text-sm text-gray-600">You will be logged out</p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Log Out
          </Button>
          <Button
            onClick={() => setOpen(false)}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            Stay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

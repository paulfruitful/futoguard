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
import { signOut } from "next-auth/react";

interface LogoutDialogProps {
  children: React.ReactNode;
}

export function LogoutDialog({ children }: LogoutDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-4">
          <h3 className="text-lg font-semibold mb-2">Are You Sure?</h3>
          <p className="text-sm text-gray-600">You will be logged out</p>
        </div>

        <DialogFooter className="flex gap-5">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

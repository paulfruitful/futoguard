import React from "react";
import { LogoutDialog } from "../logout-dialog";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

const LogOutDialog = () => {
  return (
    <LogoutDialog>
      <Button
        variant="ghost"
        //   onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full justify-start h-12 px-4 text-red-500"
      >
        <LogOut className="w-5 h-5 mr-3" />
        Log Out
      </Button>
    </LogoutDialog>
  );
};

export default LogOutDialog;

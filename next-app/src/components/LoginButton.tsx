'use client';

import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth-context";
import { LockIcon, UnlockIcon } from "lucide-react";

export function LoginButton() {
  const { user, login, logout } = useAuth();

  return (
    <Button
      onClick={user ? logout : login}
      variant="outline"
      className="w-full rounded-full px-6 py-2 shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary/90 active:scale-95 active:shadow-inner relative overflow-hidden group"
    >
      <div className="flex items-center relative z-10">
        {!user && (
          <div className="mr-2 relative">
            <LockIcon className="h-4 w-4 transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:rotate-12 group-hover:translate-y-2" />
            <UnlockIcon className="h-4 w-4 absolute top-0 left-0 transition-all duration-300 opacity-0 -rotate-12 -translate-y-2 group-hover:opacity-100 group-hover:rotate-0 group-hover:translate-y-0" />
          </div>
        )}
        <span>{user ? 'Sign Out' : 'Sign in with Google'}</span>
      </div>
      <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
    </Button>
  );
}
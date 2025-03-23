'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogOut, LockIcon } from 'lucide-react';
import Logo from "/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-2">
  <Link href="/dashboard" className="flex items-center space-x-2">
    <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-sm">
      <Image src={Logo} alt="Logo" className="h-7 w-7 text-white" />
    </div>
    <span className="font-bold text-xl">CourseDash</span>
  </Link>
</div>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.displayName || user.email}
                </span>
                {user.photoURL && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:text-white group relative overflow-hidden transition-all duration-300 hover:border-blue-600 hover:shadow-md"
                >
                  <div className="flex items-center relative z-10">
                    <div className="mr-2 relative">
                      <LogOut className="h-4 w-4 transition-all duration-300 group-hover:rotate-12 group-hover:translate-y-1" />
                    </div>
                    <span>Logout</span>
                  </div>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

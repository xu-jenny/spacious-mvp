"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  return (
    <header className="w-full bg-[#F8F5E9] shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <Link href="/landing">
        <Image
          src="/logo_transparent.png"
          alt="Logo"
          width={200}
          height={50}
          className="h-8 cursor-pointer"
        />
      </Link>

      {/* Placeholder Authentication Buttons */}
      <div className="flex space-x-4">
        <Link href="/auth">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Getting Start
          </button>
        </Link>
      </div>
    </header>
  );
}

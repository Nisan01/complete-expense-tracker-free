"use client";

import { UserButton, useUser } from "@clerk/nextjs";

import React from "react";


import Link from "next/link";
import { signOut } from "@clerk/nextjs";

export default function Header() {

const {user,isSignedIn} = useUser();


return (
    <header className="text-white p-4 relative flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 pointer-cursor">
      {/* Left: Greeting */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#333] rounded-[5px] px-4 py-2 shadow-md text-center md:text-left">
       
       <Link href="/">
       
        <span className="text-base md:text-lg font-semibold tracking-wide text-white font-sans">
       👋 Hey,&nbsp;
          <span className="text-purple-500">
            {isSignedIn ? user?.firstName || "User" : "Guest"}
          </span>
        </span>
        </Link>
      </div>

      {/* Center: Title */}
      <div className="w-full md:w-1/3 border-b border-gray-400 pb-0.5 flex justify-center items-center">
        <span className="staatliches-regular uppercase text-lg md:text-xl tracking-[6px] md:tracking-[8px] text-center [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
          Expense Tracker
        </span>
      </div>

      {/* Right: Auth section */}
      <div className="flex items-center gap-4">
        {isSignedIn && (
          <div className="flex items-center rounded-full overflow-hidden bg-white border-2 border-white">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: "40px",
                    height: "40px",
                  },
                },
              }}
            />
          </div>
        )}

        {isSignedIn ? (
          <button
            onClick={() => Clerk.signOut()}
            className="cursor-pointer bg-gradient-to-r from-[#1a1a1a] to-[#333] rounded-[5px] px-5 py-2 shadow-md text-sm md:text-base"
          >
            Logout
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl mb-2">👉</span>
            <Link href="/sign-in">
              <button className="cursor-pointer bg-gradient-to-r from-[#1a1a1a] to-[#333] rounded-[5px] px-5 py-2 shadow-md text-sm md:text-base">
                Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

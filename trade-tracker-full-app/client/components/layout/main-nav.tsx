"use client";

import Link from "next/link";

export function MainNav() {
  return (
    <nav className="flex items-center">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <span className="font-bold">Trade Tracker</span>
      </Link>
    </nav>
  );
}

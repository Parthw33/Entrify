"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Admin", href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="text-lg font-semibold text-foreground">
              स्नेहबंध पंढरपूर २०२५
            </Link>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {session.status === "unauthenticated" && (
              <Button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "https://localhost:3000/dashboard",
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login
              </Button>
            )}
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-8">
            {navigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {/* Authentication Button (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {session.status === "unauthenticated" && (
              <Button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "https://localhost:3000/dashboard",
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login
              </Button>
            )}
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-4 py-4">
            {navigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-2 text-sm font-medium text-foreground border-b"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

export function Nav() {
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Admin", href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-lg font-semibold text-foreground mr-8"
            >
              स्नेहबंध पंढरपूर २०२५
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
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
          </div>
          <div className="flex items-center space-x-4">
            {/* Login Button */}
            <Link href="/">
              <Button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "https://snehband-pandharpur-2025.vercel.app",
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login
              </Button>
            </Link>

            {/* Mode Toggle */}
            <ModeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}

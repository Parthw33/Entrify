"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  ShieldAlert,
  Clock,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navigation = [
    { name: "Home", href: "/", icon: <Home size={16} /> },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    { name: "Admin", href: "/admin", icon: <ShieldAlert size={16} /> },
    {
      name: "New Registrations",
      href: "/newlyRegistered",
      icon: <Clock size={16} />,
    },
    {
      name: "Introduction View",
      href: "/introductionView",
      icon: <Heart size={16} />,
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur transition-all duration-200",
        scrolled ? "bg-background/95 border-b shadow-sm" : "bg-background/50"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-lg font-semibold text-foreground transition-colors"
            >
              <span className="hidden sm:inline-block">
                स्नेहबंध पंढरपूर २०२५
              </span>
              <span className="sm:hidden">स्नेहबंध पंढरपूर २०२५</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:space-x-6 items-center">
            {navigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "group flex items-center space-x-1 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all">
                  {link.icon}
                </span>
                <span>{link.name}</span>
                {pathname === link.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                )}
              </Link>
            ))}

            {/* Login Button Desktop */}
            {session.status === "unauthenticated" && (
              <Button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                size="sm"
                className="ml-4"
              >
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            {session.status === "unauthenticated" && (
              <Button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                size="sm"
                variant="outline"
                className="mr-2"
              >
                Sign In
              </Button>
            )}
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              className="relative text-foreground"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t",
          menuOpen ? "max-h-[320px] border-t" : "max-h-0 border-t-transparent"
        )}
      >
        <div className="px-4 py-3 space-y-1 bg-background/95">
          {navigation.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

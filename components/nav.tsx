"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  ShieldAlert,
  Clock,
  Users,
  UserCog,
  LogOut,
  View,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Nav() {
  const pathname = usePathname();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get user role from session
  const userRole = session?.data?.user?.role || "default";
  const isDefaultRole = userRole === "default";
  const isReadOnlyRole = userRole === "readOnly";
  const isUserRole = userRole === "user";
  const isAdminRole = userRole === "admin";

  // Special case for registerPandharpur route
  const isPandharpurRegisterPage = pathname === "/registerPandharpur";

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

  // Only include non-home routes if user is not in default role
  const navigation = [
    ...(isPandharpurRegisterPage
      ? []
      : [{ name: "Home", href: "/", icon: <Home size={18} /> }]),
    ...(isDefaultRole || !session?.data?.user
      ? []
      : [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard size={18} />,
          },
          {
            name:
              session?.data?.user?.role === "admin"
                ? "Admin"
                : "Registered Users",
            href: "/admin",
            icon:
              session?.data?.user?.role === "admin" ? (
                <ShieldAlert size={18} />
              ) : (
                <Users size={18} />
              ),
          },
          // Add the Manage Users link only for admins
          ...(session?.data?.user?.role === "admin"
            ? [
                {
                  name: "Manage Users",
                  href: "/admin/manage-users",
                  icon: <UserCog size={18} />,
                },
              ]
            : []),
          // Show both New Registrations and Introduction View for admin only
          ...(isAdminRole
            ? [
                {
                  name: "New Registrations",
                  href: "/newlyRegistered",
                  icon: <Clock size={18} />,
                },
                {
                  name: "Introduction View",
                  href: "/introductionView",
                  icon: <View size={18} />,
                },
                {
                  name: "Pandharpur Registeration",
                  href: "/admin/pandharpur-profiles",
                  icon: <View size={18} />,
                },
              ]
            : []),
          // Show only New Registrations for user role
          ...(isUserRole
            ? [
                {
                  name: "New Registrations",
                  href: "/newlyRegistered",
                  icon: <Clock size={18} />,
                },
              ]
            : []),
        ]),
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = session?.data?.user?.name || "";
    if (!name) return "U";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

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
          {!isPandharpurRegisterPage ? (
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-foreground transition-colors"
              >
                <span className="hidden sm:inline-block">
                  स्नेहबंध पंढरपूर २०२५
                </span>
                <span className="sm:hidden">स्नेहबंध पंढरपूर २०२५</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-foreground transition-colors">
              <span className="hidden sm:inline-block">
                स्नेहबंध पंढरपूर २०२५
              </span>
              <span className="sm:hidden">स्नेहबंध पंढरपूर २०२५</span>
            </div>
          )}

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

            {/* Login Button or User Avatar with Dropdown Desktop */}
            {!session.data ? (
              !isPandharpurRegisterPage && (
                <Button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  size="sm"
                  className="ml-4"
                >
                  Sign In
                </Button>
              )
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ml-4 p-0"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {session.data.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.data.user?.email}
                    </p>
                    <div className="mt-1 pt-1">
                      <p className="text-xs text-muted-foreground border-t pt-1">
                        Role: <span className="font-medium">{userRole}</span>
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            {!session.data ? (
              !isPandharpurRegisterPage && (
                <Button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  size="sm"
                  variant="outline"
                  className="mr-2"
                >
                  Sign In
                </Button>
              )
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full mr-2 p-0"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {session.data.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.data.user?.email}
                    </p>
                    <div className="mt-1 pt-1">
                      <p className="text-xs text-muted-foreground border-t pt-1">
                        Role: <span className="font-medium">{userRole}</span>
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          menuOpen
            ? "max-h-[400px] border-t shadow-lg"
            : "max-h-0 border-t-transparent"
        )}
      >
        <div className="px-4 py-2 space-y-1 bg-background/95">
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
              <span className="text-current">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
          {/* Add sign out for mobile menu when logged in */}
          {session.status === "authenticated" && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors text-red-600 hover:bg-red-50 mt-2"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

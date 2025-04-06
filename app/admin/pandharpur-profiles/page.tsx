"use client";

import PandharpurTableWithSkeleton from "@/app/admin/pandharpur-profiles/components/pandharpurTableWithSkeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PandharpurProfilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if the session is loaded and user is not an admin
    if (status === "authenticated") {
      const isAdmin = session?.user?.role === "admin";

      if (!isAdmin) {
        // If not admin, redirect to homepage
        router.push("/");
      } else {
        // If admin, mark as authorized
        setIsAuthorized(true);
      }
    } else if (status === "unauthenticated") {
      // If not authenticated, redirect to homepage
      router.push("/");
    }
  }, [status, session, router]);

  // Show loading state while checking authorization
  if (status === "loading" || !isAuthorized) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Only render the content if user is authorized (admin)
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pandharpur Entries</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all Pandharpur profiles
          </p>
        </div>

        <PandharpurTableWithSkeleton />
      </div>
    </div>
  );
}

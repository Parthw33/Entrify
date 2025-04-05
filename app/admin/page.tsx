"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import StatCards from "./components/statCards";
import ApprovedUsersDialog from "./components/approvedUsersDialog";
import CsvUploader from "./components/csvUploader";
import UsersTableWithSkeleton from "./components/usersTableWithSkeleton";

export default function Admin() {
  const { data: session, status } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  // Check for default role and redirect to home
  useEffect(() => {
    if (!session && status !== "loading") {
      // Redirect if not authenticated
      toast.error("Please login to access this page");
      router.push("/");
      return;
    }

    // Only block the default role, allow readOnly to view
    if (status === "authenticated" && session?.user?.role === "default") {
      toast.error("You don't have permission to access this page.");
      router.push("/");
    }
  }, [status, session, router]);

  const handleApprovedCardClick = () => {
    setIsDialogOpen(true);
  };

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Analytics Dashboard */}
      <StatCards onApprovedClick={handleApprovedCardClick} />

      {/* Approved Users Dialog */}
      <ApprovedUsersDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Users Table with Skeleton */}
      <UsersTableWithSkeleton />

      {/* CSV Upload Section - only visible to admin users */}
      {isAdmin && <CsvUploader />}
    </div>
  );
}

"use client";

import { useState } from "react";
import StatCards from "./components/statCards";
import ApprovedUsersDialog from "./components/approvedUsersDialog";
import CsvUploader from "./components/csvUploader";
import UsersTableWithSkeleton from "./components/usersTableWithSkeleton";

export default function Admin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApprovedCardClick = () => {
    setIsDialogOpen(true);
  };

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

      {/* CSV Upload Section */}
      <CsvUploader />
    </div>
  );
}

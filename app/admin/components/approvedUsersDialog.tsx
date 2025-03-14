import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import ApprovedProfileRow, { Profile } from "./approvedProfileRow";

interface ApprovedUsersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApprovedUsersDialog({
  isOpen,
  onOpenChange,
}: ApprovedUsersDialogProps) {
  const [approvedProfiles, setApprovedProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const getApprovedProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profiles/approved", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setApprovedProfiles(data.profiles);
    } catch (error) {
      console.error("Failed to fetch approved profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dialog opens
  if (isOpen && !loading && approvedProfiles.length === 0) {
    getApprovedProfiles();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Approved Users</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-28" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Anubandh ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Birth Place</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Approval Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No approved users found
                    </TableCell>
                  </TableRow>
                ) : (
                  approvedProfiles.map((profile) => (
                    <ApprovedProfileRow key={profile.id} profile={profile} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

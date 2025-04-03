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
import { getApprovedProfiles } from "@/app/actions/getApprovedProfiles";

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

  const fetchApprovedProfiles = async () => {
    try {
      setLoading(true);
      const data = await getApprovedProfiles();
      setApprovedProfiles(data.profiles);
    } catch (error) {
      console.error("Failed to fetch approved profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dialog opens
  if (isOpen && !loading && approvedProfiles.length === 0) {
    fetchApprovedProfiles();
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
                  <TableHead className="whitespace-nowrap">
                    Anubandh ID
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Mobile Number
                  </TableHead>
                  <TableHead>Birth Place</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Introduction
                  </TableHead>
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

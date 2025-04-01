import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Check, CheckCircle, X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Assuming you have a Dialog component.
import { Profile1 } from "./approvedProfileRow";

interface UserTableProps {
  users: Profile1[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile1 | null>(null);
  const [approvalFilter, setApprovalFilter] = useState<string>("All");

  // Filter users based on search query and approval status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.anubandhId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobileNumber.includes(searchQuery);

    const matchesApprovalStatus =
      approvalFilter === "All" ||
      (approvalFilter === "Approved" && user.approvalStatus) ||
      (approvalFilter === "Pending" && !user.approvalStatus);

    return matchesSearch && matchesApprovalStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handleUserClick = (user: Profile1) => {
    setSelectedUser(user);
  };

  const handleApproveProfile = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch("/api/profile/userApproval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUser.anubandhId,
          approvalStatus: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to approve: ${response.status}`
        );
      }

      setSelectedUser({
        ...selectedUser,
        approvalStatus: true,
      });

      alert("Profile approved successfully");

      setSelectedUser(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve profile";
      console.error("Approval error:", error);
    }
  };

  return (
    <Card className="mt-6 border shadow-sm">
      <CardHeader className="bg-slate-50 border-b flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>
              Complete list of all registered user profiles
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {filteredUsers.length} Users Found
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search by name, email, ID, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3"
          />
          <Select
            value={approvalFilter}
            onValueChange={(value) => {
              setApprovalFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Anubandh ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Approval Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleUserClick(user)} // Handle user click to open modal
                  >
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-slate-200">
                        <AvatarFallback>
                          {user.photo ? (
                            <Image
                              src={user.photo}
                              width={50}
                              height={50}
                              alt="Profile"
                            />
                          ) : (
                            user.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </TableCell>
                    <TableCell>{user.anubandhId}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobileNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.approvalStatus ? "default" : "outline"}
                        className={
                          user.approvalStatus
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }
                      >
                        {user.approvalStatus ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Approved
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5" /> Pending
                          </>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between py-4 px-4 border-t">
          <div className="flex items-center gap-2">
            <p className="text-sm">Rows per page</p>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              <PaginationItem>
                Page {currentPage} of {totalPages}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>

      {/* Dialog Box */}
      {selectedUser && (
        <Dialog
          open={Boolean(selectedUser)}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogTrigger />
          <DialogContent className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <DialogTitle>{selectedUser.name}</DialogTitle>
            <DialogDescription>
              <div className="space-y-4">
                <p>
                  <strong>Anubandh ID:</strong> {selectedUser.anubandhId}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Mobile Number:</strong> {selectedUser.mobileNumber}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {selectedUser.dateOfBirth
                    ? new Date(selectedUser.dateOfBirth).toLocaleDateString(
                        "en-GB"
                      )
                    : "N/A"}
                </p>
                <p>
                  <strong>Birth Time:</strong> {selectedUser.birthTime}
                </p>
                <p>
                  <strong>Birth Place:</strong> {selectedUser.birthPlace}
                </p>
                <p>
                  <strong>Education:</strong> {selectedUser.education}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedUser.permanentAddress || selectedUser.currentAddress}
                </p>
                <p>
                  <strong>Attendee Count:</strong> {selectedUser.attendeeCount}
                </p>
              </div>
            </DialogDescription>
            <DialogFooter className="flex justify-end pt-4">
              {!selectedUser.approvalStatus && (
                <button
                  onClick={handleApproveProfile}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg flex items-center"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Profile
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default UserTable;

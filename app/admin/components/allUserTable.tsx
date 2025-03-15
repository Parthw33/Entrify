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
import { Check, X, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Profile } from "./approvedProfileRow";
import Image from "next/image";

interface UserTableProps {
  users: Profile[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = users?.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users?.length / rowsPerPage);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="mt-6 border shadow-sm">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {/* <Users className="h-5 w-5 text-slate-500" /> */}
              Registered Users
            </CardTitle>
            <CardDescription>
              Complete list of all registered user profiles
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {users.length} Total Users
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-medium">Name</TableHead>
                <TableHead className="font-medium">Anubandh ID</TableHead>
                <TableHead className="font-medium">Email</TableHead>
                <TableHead className="font-medium">Mobile Number</TableHead>
                <TableHead className="font-medium">Birth Place</TableHead>
                <TableHead className="font-medium">Education</TableHead>
                <TableHead className="font-medium">Approval Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found in the database
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-slate-200">
                          <AvatarFallback className="text-xs">
                            {user?.photo ? (
                              <Image
                                src={user.photo}
                                width={50}
                                height={50}
                                alt="Profile"
                              />
                            ) : (
                              getInitials(user.name)
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.anuBandhId}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobileNumber}</TableCell>
                    <TableCell>{user.birthPlace || "—"}</TableCell>
                    <TableCell>{user.education || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.approvalStatus ? "default" : "outline"}
                        className={
                          user.approvalStatus
                            ? "bg-green-50 text-green-700 hover:bg-green-50"
                            : "bg-red-50 text-red-700 hover:bg-red-50"
                        }
                      >
                        <div className="flex items-center gap-1">
                          {user.approvalStatus ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Approved
                            </>
                          ) : (
                            <>
                              <X className="h-3.5 w-3.5" /> Pending
                            </>
                          )}
                        </div>
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
            <p className="text-sm text-muted-foreground">Rows per page</p>
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
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTable;

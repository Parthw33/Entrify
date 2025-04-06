"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getNewlyRegisteredUsers } from "@/app/actions/getNewlyRegisteredUsers";
import { Profile1 } from "@/app/admin/components/approvedProfileRow";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { exportProfilesToPDF, formatDate } from "@/app/utils/pdfExport";

export default function NewlyRegisteredPage() {
  const [users, setUsers] = useState<Profile1[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session, status } = useSession();
  const router = useRouter();

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

  // Get current page users
  const indexOfLastUser = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - ITEMS_PER_PAGE;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Check for unauthenticated or default role users and redirect to home
  useEffect(() => {
    if (!session && status !== "loading") {
      // Redirect if not authenticated
      toast.error("Please login to access this page");
      router.push("/");
      return;
    }

    if (
      (status === "authenticated" && session?.user?.role === "default") ||
      session?.user?.role === "readOnly"
    ) {
      toast.error("You don't have permission to access this page.");
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const data = await getNewlyRegisteredUsers();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching newly registered users:", error);
        toast.error("Failed to load newly registered users");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Function to export all users to PDF
  const handleExportPDF = async () => {
    await exportProfilesToPDF({
      title: "Newly Registered Users",
      fileName: "newly-registered-users",
      profiles: users,
      includeDetails: true,
      isIntroduction: true,
      pageSize: 2,
    });
  };

  // Function to export current page to PDF
  const handleExportCurrentPagePDF = async () => {
    await exportProfilesToPDF({
      title: `Newly Registered Users - Page ${currentPage}`,
      fileName: `newly-registered-users-page-${currentPage}`,
      profiles: currentUsers,
      includeDetails: true,
      currentPage: currentPage,
      pageSize: 2,
      isIntroduction: true,
    });
  };

  // Calculate days ago
  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4 md:mb-6">
        Newly Registered Users
      </h1>
      <p className="text-muted-foreground mb-4 md:mb-6">
        Showing users who registered within the last 2 days
      </p>

      {isLoading ? (
        <Card className="border shadow-sm p-4 md:p-6">
          <div className="space-y-3 md:space-y-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-6 md:p-12 text-center border shadow-sm">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No new registrations in the last 48 hours
            </p>
            <Button variant="outline">Go to Dashboard</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4 md:mt-6 border shadow-sm">
          <CardHeader className="bg-slate-50 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Clock size={20} />
                Recent Registrations
              </CardTitle>
              <CardDescription>Last 48 hours</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 w-fit"
              >
                {users.length} New Users
              </Badge>
              <Button
                size="sm"
                onClick={handleExportPDF}
                className="flex items-center gap-2 w-fit"
              >
                <Download size={14} />
                Export PDF
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-slate-50 border-b">
              <div className="text-sm text-muted-foreground mb-2 md:mb-0">
                Showing page {currentPage} of {totalPages}
              </div>
              <Button
                onClick={handleExportCurrentPagePDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-fit"
              >
                <Download className="h-3.5 w-3.5" />
                Export Current Page
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Anubandh ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Registration
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell>
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photo || ""} alt={user.name} />
                          <AvatarFallback
                            className={
                              user.gender === "MALE"
                                ? "bg-blue-100"
                                : "bg-pink-100"
                            }
                          >
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {user.anubandhId}
                      </TableCell>
                      <TableCell className="font-medium max-w-[100px] md:max-w-none truncate">
                        {user.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.gender === "MALE"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-pink-50 text-pink-700"
                          }
                        >
                          {user.gender === "MALE"
                            ? "M"
                            : user.gender === "FEMALE"
                            ? "F"
                            : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[150px] truncate">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {user.mobileNumber}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span>
                            {format(
                              new Date(user.createdAt),
                              "dd MMM yyyy, HH:mm"
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getDaysAgo(user.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.approvalStatus ? "default" : "outline"}
                          className={
                            user.approvalStatus
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }
                        >
                          {user.approvalStatus ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 border-t">
                <div className="text-sm text-muted-foreground mb-3 md:mb-0">
                  Total of {users.length} new registrations
                </div>
                <Pagination className="mt-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, i, array) => {
                        // Add ellipsis if there's a gap
                        if (i > 0 && page > array[i - 1] + 1) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

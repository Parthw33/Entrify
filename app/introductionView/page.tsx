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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIntroductionProfiles } from "@/app/actions/getIntroductionProfiles";
import { Profile1 } from "@/app/admin/components/approvedProfileRow";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  User,
  Calendar,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  View,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { format, parse, isValid } from "date-fns";
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

export default function IntroductionView() {
  const [profiles, setProfiles] = useState<Profile1[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    maleCount: 0,
    femaleCount: 0,
  });
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const ITEMS_PER_PAGE = 5;

  // Sort profiles by updatedAt field
  const sortedProfiles = [...profiles].sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0);
    const dateB = new Date(b.updatedAt || 0);
    return dateA.getTime() - dateB.getTime(); // Changed to ascending order (oldest first)
  });

  const totalPages = Math.ceil(sortedProfiles.length / ITEMS_PER_PAGE);

  // Get current page profiles
  const indexOfLastProfile = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProfile = indexOfLastProfile - ITEMS_PER_PAGE;
  const currentProfiles = sortedProfiles.slice(
    indexOfFirstProfile,
    indexOfLastProfile
  );

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setCurrentPage(1); // Reset to first page when changing sort
  };

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
    async function fetchProfiles() {
      setIsLoading(true);
      try {
        const data = await getIntroductionProfiles();
        setProfiles(data.profiles);
        setStats({
          total: data.total,
          maleCount: data.maleCount,
          femaleCount: data.femaleCount,
        });
      } catch (error) {
        console.error("Error fetching introduction profiles:", error);
        toast.error("Failed to load introduction profiles");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  // Format date for display
  const formatUpdatedDate = (dateString: any) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "PPP p"); // Format: "Apr 29, 2023, 1:30 PM"
    } catch (error) {
      return "Invalid date";
    }
  };

  // Function to export all profiles to PDF
  const handleExportPDF = async () => {
    await exportProfilesToPDF({
      title: "Introduction Profiles",
      fileName: "introduction-profiles",
      profiles: sortedProfiles, // Use sorted profiles
      includeDetails: true,
      pageSize: 2,
      isIntroduction: true,
      genderFilter: "ALL",
    });
  };

  // Function to export current page to PDF
  const handleExportCurrentPagePDF = async () => {
    await exportProfilesToPDF({
      title: `Introduction Profiles - Page ${currentPage}`,
      fileName: `introduction-profiles-page-${currentPage}`,
      profiles: currentProfiles,
      includeDetails: true,
      pageSize: 2,
      isIntroduction: true,
      genderFilter: "ALL",
    });
  };

  // Function to export only male profiles
  const handleExportMaleProfilesPDF = async () => {
    await exportProfilesToPDF({
      title: "Introduction Profiles",
      fileName: "introduction-profiles-male",
      profiles: sortedProfiles.filter((p) => p.gender === "MALE"),
      includeDetails: true,
      pageSize: 2,
      isIntroduction: true,
      genderFilter: "MALE",
    });
  };

  // Function to export only female profiles
  const handleExportFemaleProfilesPDF = async () => {
    await exportProfilesToPDF({
      title: "Introduction Profiles",
      fileName: "introduction-profiles-female",
      profiles: sortedProfiles.filter((p) => p.gender === "FEMALE"),
      includeDetails: true,
      pageSize: 2,
      isIntroduction: true,
      genderFilter: "FEMALE",
    });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 md:mb-6">
        Introduction Profiles
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 md:mb-6">
        Showing profiles interested in introductions
      </p>

      {isLoading ? (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border shadow-sm p-3 sm:p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full mx-auto md:mx-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 sm:h-6 w-1/3" />
                  <Skeleton className="h-3 sm:h-4 w-1/2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 sm:mt-4">
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card className="p-4 sm:p-6 md:p-12 text-center border shadow-sm">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No introduction profiles found
            </p>
            <Button variant="outline">Go to Dashboard</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-3 sm:mt-4 md:mt-6 border shadow-sm">
          <CardHeader className="bg-slate-50 border-b flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <View size={18} className="hidden sm:inline" />
                  <View size={16} className="sm:hidden" />
                  Introduction Profiles
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Profiles with introduction status enabled
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-blue-50 rounded-md overflow-x-auto whitespace-nowrap text-xs sm:text-sm">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
                  >
                    <User className="h-3 w-3 mr-0.5 sm:mr-1" />
                    Males: {stats.maleCount}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-pink-50 text-pink-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
                  >
                    <User className="h-3 w-3 mr-0.5 sm:mr-1" />
                    Females: {stats.femaleCount}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
                  >
                    <FilePlus className="h-3 w-3 mr-0.5 sm:mr-1" />
                    Total: {stats.total}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    onClick={handleExportPDF}
                    className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Download size={14} />
                    <span className="sm:inline">Print All</span>
                    <span className="sm:hidden">All</span>
                  </Button>

                  <div className="flex">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportMaleProfilesPDF}
                      className="flex items-center gap-1 rounded-r-none border-r-0 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Download size={12} className="sm:size-14" />
                      <span className="sm:inline">Print Males</span>
                      <span className="sm:hidden">Males</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportFemaleProfilesPDF}
                      className="flex items-center gap-1 rounded-l-none bg-pink-50 text-pink-700 hover:bg-pink-100 hover:text-pink-800 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Download size={12} className="sm:size-14" />
                      <span className="sm:inline">Print Females</span>
                      <span className="sm:hidden">Females</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing page {currentPage} of {totalPages}
                </div>
                <Button
                  onClick={toggleSortDirection}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8 ml-0 sm:ml-2 w-fit"
                >
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>
                    {sortDirection === "desc" ? "Newest first" : "Oldest first"}
                  </span>
                  <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
              <Button
                onClick={handleExportCurrentPagePDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 w-fit text-xs sm:text-sm h-7 sm:h-8"
              >
                <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sm:inline">Export Current Page</span>
                <span className="sm:hidden">Export Page</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {currentProfiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div
                    className={`h-1.5 sm:h-2 ${
                      profile.gender === "MALE" ? "bg-blue-500" : "bg-pink-500"
                    }`}
                  ></div>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 mb-2 border-2 border-slate-100">
                          <AvatarImage
                            src={profile.photo || ""}
                            alt={profile.name}
                          />
                          <AvatarFallback
                            className={`text-lg sm:text-xl ${
                              profile.gender === "MALE"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {profile.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Badge
                          variant="outline"
                          className={
                            profile.gender === "MALE"
                              ? "bg-blue-50 text-blue-700 mt-1 sm:mt-2 text-xs"
                              : "bg-pink-50 text-pink-700 mt-1 sm:mt-2 text-xs"
                          }
                        >
                          {profile.gender === "MALE" ? "Male" : "Female"}
                        </Badge>
                        <div className="text-xs sm:text-sm font-medium mt-1 text-center">
                          {profile.anubandhId}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 md:mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-2 md:mt-0 text-center md:text-left">
                            {profile.name}
                          </h3>
                          {profile.updatedAt && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 justify-center sm:justify-start mt-1 sm:mt-0">
                              <Clock className="h-3 w-3" />
                              <span>
                                Updated: {formatUpdatedDate(profile.updatedAt)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-sm">
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-xs sm:text-sm text-slate-500">
                                Date of Birth
                              </div>
                              <div className="font-medium text-sm sm:text-base">
                                {formatDate(profile.dateOfBirth)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-xs sm:text-sm text-slate-500">
                                Education
                              </div>
                              <div className="font-medium text-sm sm:text-base">
                                {profile.education || "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-xs sm:text-sm text-slate-500">
                                Mobile
                              </div>
                              <div className="font-medium text-sm sm:text-base">
                                {profile.mobileNumber}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-xs sm:text-sm text-slate-500">
                                स्व गोत्र
                              </div>
                              <div className="font-medium text-sm sm:text-base">
                                {profile.firstGotra}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-xs sm:text-sm text-slate-500">
                                Email
                              </div>
                              <div className="font-medium text-sm sm:text-base break-all">
                                {profile.email}
                              </div>
                            </div>
                          </div>

                          {(profile.birthPlace ||
                            (profile as any).permanentAddress) && (
                            <div className="flex items-start gap-1.5 sm:gap-2 md:col-span-2">
                              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5" />
                              <div>
                                <div className="text-xs sm:text-sm text-slate-500">
                                  {profile.birthPlace
                                    ? "Birth Place"
                                    : "Address"}
                                </div>
                                <div className="font-medium text-sm sm:text-base">
                                  {profile.birthPlace ||
                                    (profile as any).permanentAddress ||
                                    profile.currentAddress ||
                                    "N/A"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4 sm:mt-6">
                <Pagination>
                  <PaginationContent className="flex flex-wrap justify-center gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        className={`${
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        } h-8 w-8 sm:h-10 sm:w-auto p-0 sm:p-2.5`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          Previous
                        </span>
                      </PaginationPrevious>
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
                              className="h-8 w-8 sm:h-10 sm:w-10 p-0"
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
                        className={`${
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        } h-8 w-8 sm:h-10 sm:w-auto p-0 sm:p-2.5`}
                      >
                        <span className="sr-only sm:not-sr-only sm:mr-1">
                          Next
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </PaginationNext>
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

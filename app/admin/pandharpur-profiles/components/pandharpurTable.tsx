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
import { Check, CheckCircle, X, User, Users, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PandharpurProfileData } from "@/app/actions/getPandharpurProfiles";
import { updatePandharpurProfileStatus } from "@/app/actions/updatePandharpurProfileStatus";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface PandharpurTableProps {
  profiles: PandharpurProfileData[];
  refetchData: () => Promise<void>;
}

const PandharpurTable: React.FC<PandharpurTableProps> = ({
  profiles,
  refetchData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] =
    useState<PandharpurProfileData | null>(null);
  const [approvalFilter, setApprovalFilter] = useState<string>("All");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [dialogBox, setDialogBox] = useState(false);
  const [introductionChecked, setIntroductionChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isUser = session?.user?.role === "user";
  const canApprove = isAdmin || isUser;

  // Filter profiles based on search query, approval status, and gender
  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.anubandhId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.mobileNumber.includes(searchQuery);

    const matchesApprovalStatus =
      approvalFilter === "All" ||
      (approvalFilter === "Approved" && profile.approvalStatus) ||
      (approvalFilter === "Pending" && !profile.approvalStatus);

    const matchesGender =
      genderFilter === "All" ||
      (genderFilter === "Male" && profile.gender === "MALE") ||
      (genderFilter === "Female" && profile.gender === "FEMALE");

    return matchesSearch && matchesApprovalStatus && matchesGender;
  });

  // Pagination
  const indexOfLastProfile = currentPage * rowsPerPage;
  const indexOfFirstProfile = indexOfLastProfile - rowsPerPage;
  const currentProfiles = filteredProfiles.slice(
    indexOfFirstProfile,
    indexOfLastProfile
  );
  const totalPages = Math.ceil(filteredProfiles.length / rowsPerPage);

  const handleProfileClick = (profile: PandharpurProfileData) => {
    setSelectedProfile(profile);
    setIntroductionChecked(profile.introductionStatus || false);
    setDialogBox(true);
  };

  const handleApproveProfile = async () => {
    if (!selectedProfile) return;
    setIsSubmitting(true);

    try {
      await updatePandharpurProfileStatus({
        anubandhId: selectedProfile.anubandhId,
        attendeeCount: selectedProfile.attendeeCount,
        introductionStatus: introductionChecked,
      });

      setSelectedProfile({
        ...selectedProfile,
        approvalStatus: true,
        introductionStatus: introductionChecked,
      });

      toast.success("Profile approved successfully");

      // Refetch data from backend to update UI with fresh data
      await refetchData();

      setTimeout(() => {
        setDialogBox(false);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve entry";
      toast.error(errorMessage);
      console.error("Approval error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIntroductionStatus = async () => {
    if (!selectedProfile) return;

    // Only allow updates for approved profiles
    if (!selectedProfile.approvalStatus) {
      toast.error(
        "Profile must be approved before setting introduction status"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePandharpurProfileStatus({
        anubandhId: selectedProfile.anubandhId,
        introductionStatus: introductionChecked,
        attendeeCount: selectedProfile.attendeeCount,
      });

      setSelectedProfile({
        ...selectedProfile,
        introductionStatus: introductionChecked,
      });

      toast.success(
        introductionChecked
          ? "Introduction status set successfully"
          : "Introduction status removed successfully"
      );

      // Refetch data from backend to update UI with fresh data
      await refetchData();

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        setDialogBox(false);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update introduction status";
      toast.error(errorMessage);
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="mt-4 sm:mt-6 border shadow-sm">
      <CardHeader className="bg-slate-50 border-b flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg md:text-xl">
              Pandharpur Registered Profiles
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Complete list of all registered Pandharpur profiles
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 w-fit">
            {filteredProfiles.length} Profiles Found
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Input
            type="text"
            placeholder="Search by name, email address, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/2 md:w-1/3 text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={approvalFilter}
              onValueChange={(value) => {
                setApprovalFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 sm:h-9 w-full sm:w-auto min-w-[120px] text-xs sm:text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={genderFilter}
              onValueChange={(value) => {
                setGenderFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 sm:h-9 w-full sm:w-auto min-w-[120px] text-xs sm:text-sm">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Genders</SelectItem>
                <SelectItem value="Male">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100">
                      <User size={12} className="text-blue-600" />
                    </span>
                    <span className="text-blue-600 font-medium">Male</span>
                  </span>
                </SelectItem>
                <SelectItem value="Female">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-100">
                      <User size={12} className="text-pink-600" />
                    </span>
                    <span className="text-pink-600 font-medium">Female</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Anubandh ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Approval Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProfiles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No profiles found
                  </TableCell>
                </TableRow>
              ) : (
                currentProfiles.map((profile) => (
                  <TableRow
                    key={profile.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleProfileClick(profile)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-slate-200">
                          <AvatarFallback>
                            {profile.photo ? (
                              <Image
                                src={profile.photo}
                                width={50}
                                height={50}
                                alt="Profile"
                              />
                            ) : (
                              profile.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                    <TableCell>{profile.anubandhId}</TableCell>
                    <TableCell>
                      <span>{profile.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          profile.gender === "MALE"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }
                      >
                        {profile.gender === "MALE"
                          ? "Male"
                          : profile.gender === "FEMALE"
                          ? "Female"
                          : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.mobileNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={profile.approvalStatus ? "default" : "outline"}
                        className={
                          profile.approvalStatus
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }
                      >
                        {profile.approvalStatus ? (
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

        {/* Mobile Card View - Shown only on small screens */}
        <div className="sm:hidden">
          {currentProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No profiles found
            </div>
          ) : (
            <div className="divide-y">
              {currentProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex items-center space-x-3"
                  onClick={() => handleProfileClick(profile)}
                >
                  <Avatar className="h-10 w-10 shrink-0 bg-slate-200">
                    <AvatarFallback>
                      {profile.photo ? (
                        <Image
                          src={profile.photo}
                          width={40}
                          height={40}
                          alt="Profile"
                        />
                      ) : (
                        profile.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <div className="text-xs font-medium text-slate-500">
                        {profile.anubandhId}
                      </div>
                    </div>
                    <div className="font-medium text-sm truncate">
                      {profile.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs px-1 py-0 ${
                          profile.gender === "MALE"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}
                      >
                        {profile.gender === "MALE"
                          ? "Male"
                          : profile.gender === "FEMALE"
                          ? "Female"
                          : "N/A"}
                      </Badge>

                      <Badge
                        variant={profile.approvalStatus ? "default" : "outline"}
                        className={`text-xs px-1 py-0 ${
                          profile.approvalStatus
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {profile.approvalStatus ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-3 sm:px-4 border-t gap-3 sm:gap-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <p className="text-muted-foreground">Rows per page</p>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 sm:h-8 w-16 sm:w-20 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Pagination className="mx-auto sm:mx-0">
            <PaginationContent className="flex items-center gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-xs sm:text-sm">
                  Page {currentPage} of {totalPages || 1}
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
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>

      {/* Dialog Box */}
      {selectedProfile && (
        <Dialog open={dialogBox} onOpenChange={setDialogBox}>
          <DialogTrigger />
          <DialogContent>
            <div
              className={`max-w-md mx-auto px-6 py-2 rounded-sm shadow-md ${
                selectedProfile.gender === "MALE"
                  ? "bg-[#00FFFF] text-black"
                  : selectedProfile.gender === "FEMALE"
                  ? "bg-pink-300 text-black"
                  : ""
              }`}
            >
              <DialogTitle>{selectedProfile.name}</DialogTitle>
            </div>
            <DialogDescription>
              <div className="space-y-4 text-black">
                <p>
                  <strong>Anubandh ID:</strong> {selectedProfile.anubandhId}
                </p>
                <p>
                  <strong>Gender:</strong>{" "}
                  {selectedProfile.gender === "MALE"
                    ? "Male"
                    : selectedProfile.gender === "FEMALE"
                    ? "Female"
                    : "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedProfile.email}
                </p>
                <p>
                  <strong>Mobile Number:</strong> {selectedProfile.mobileNumber}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {formatDate(selectedProfile.dateOfBirth)}
                </p>
                <p>
                  <strong>Birth Time:</strong> {selectedProfile.birthTime}
                </p>
                <p>
                  <strong>Birth Place:</strong> {selectedProfile.birthPlace}
                </p>
                <p>
                  <strong>Education:</strong> {selectedProfile.education}
                </p>
                <p>
                  <strong>Height:</strong> {selectedProfile.height}
                </p>
                <p>
                  <strong>First Gotra:</strong> {selectedProfile.firstGotra}
                </p>
                <p>
                  <strong>Second Gotra:</strong> {selectedProfile.secondGotra}
                </p>
                <p>
                  <strong>Annual Income:</strong> {selectedProfile.annualIncome}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedProfile.permanentAddress ||
                    selectedProfile.currentAddress}
                </p>
                <p>
                  <div className="text-lg font-bold">
                    Guest Count: {selectedProfile.attendeeCount}
                  </div>
                </p>

                {/* Introduction Status Checkbox - shown when profile is approved but introductionStatus is false,
                    or when profile is not approved (in which case it will be used when approving) */}
                {canApprove && (
                  <div className="flex items-center space-x-2">
                    {!selectedProfile.introductionStatus ? (
                      <>
                        <Checkbox
                          id={`introductionStatus-${selectedProfile.id}`}
                          checked={introductionChecked}
                          onCheckedChange={(checked) =>
                            setIntroductionChecked(checked === true)
                          }
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor={`introductionStatus-${selectedProfile.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          Interested for Introduction
                        </Label>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                )}

                {/* Show explanation if not approved but checkbox is checked */}
                {!selectedProfile.approvalStatus &&
                  introductionChecked &&
                  canApprove && (
                    <p className="text-xs text-gray-500 mt-1">
                      Introduction status will be saved when the entry is
                      approved
                    </p>
                  )}

                {/* If already approved and has introduction status, show it as text */}
                {selectedProfile.approvalStatus &&
                  selectedProfile.introductionStatus && (
                    <div className="text-lg font-bold text-green-600 flex items-center gap-2 mt-2">
                      <CheckCircle className="h-5 w-5" />
                      Interested for Introduction
                    </div>
                  )}
              </div>
            </DialogDescription>
            <DialogFooter className="flex justify-end pt-4 space-x-2">
              {!selectedProfile.approvalStatus && canApprove && (
                <button
                  onClick={handleApproveProfile}
                  disabled={isSubmitting}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg flex items-center"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isSubmitting ? "Processing..." : "Approve Entry"}
                </button>
              )}

              {/* Update Introduction Status button - shown ONLY when profile is already approved but introductionStatus is false */}
              {selectedProfile.approvalStatus &&
                !selectedProfile.introductionStatus &&
                canApprove && (
                  <button
                    onClick={handleUpdateIntroductionStatus}
                    disabled={isSubmitting}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Set Introduction Status"}
                  </button>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default PandharpurTable;

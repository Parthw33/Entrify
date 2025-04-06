"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SearchIcon,
  Mail,
  Check,
  X,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllProfileCsv,
  ProfileCsvData,
} from "@/app/actions/getAllProfileCsv";
import { sendBulkEmails } from "@/app/actions/sendBulkEmails";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BulkEmailTable() {
  const [profiles, setProfiles] = useState<ProfileCsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [emailResults, setEmailResults] = useState<{
    totalSent: number;
    totalFailed: number;
    results: {
      success: boolean;
      email: string;
      anubandhId: string;
      error?: string;
    }[];
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [approvalFilter, setApprovalFilter] = useState<string>("All");
  const [genderFilter, setGenderFilter] = useState<string>("All");

  // Fetch profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const { profiles } = await getAllProfileCsv();
        setProfiles(profiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        toast.error("Failed to load profiles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Filter profiles based on search query and filters
  const filteredProfiles = profiles.filter((profile) => {
    const searchTerms = searchQuery.toLowerCase().split(" ");
    const profileData = [
      profile.name.toLowerCase(),
      profile.anubandhId.toLowerCase(),
      profile.email.toLowerCase(),
      profile.mobileNumber,
    ].join(" ");

    const matchesSearch = searchTerms.every((term) =>
      profileData.includes(term)
    );

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

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);

    // Update select all state for current page only
    setSelectAll(
      currentProfiles.every((profile) => newSelectedRows.has(profile.id))
    );
  };

  // Toggle select all rows for current page
  const toggleSelectAll = () => {
    const newSelectedRows = new Set(selectedRows);

    if (selectAll) {
      // Remove current page items
      currentProfiles.forEach((profile) => {
        newSelectedRows.delete(profile.id);
      });
    } else {
      // Add current page items
      currentProfiles.forEach((profile) => {
        newSelectedRows.add(profile.id);
      });
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(!selectAll);
  };

  // Open confirmation dialog
  const openConfirmationDialog = () => {
    if (selectedRows.size === 0) {
      toast.warning("Please select at least one profile");
      return;
    }
    setConfirmationText("");
    setShowConfirmation(true);
  };

  // Send emails to selected profiles
  const handleSendEmails = async () => {
    try {
      setIsSending(true);
      setShowConfirmation(false);

      // Get the selected profiles data
      const selectedProfiles = profiles
        .filter((profile) => selectedRows.has(profile.id))
        .map((profile) => ({
          id: profile.id,
          anubandhId: profile.anubandhId,
          name: profile.name,
          email: profile.email,
          mobileNumber: profile.mobileNumber,
          address: profile.currentAddress,
          education: profile.education,
          attendeeCount: profile.attendeeCount,
        }));

      const results = await sendBulkEmails(selectedProfiles);
      setEmailResults(results);
      setShowResults(true);

      // Show a toast message with the results
      toast.success(
        `Sent ${results.totalSent} emails (${results.totalFailed} failed)`
      );
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Card className="w-full border shadow-sm">
        <CardHeader className="bg-slate-50 border-b flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Email Management</CardTitle>
              <CardDescription>
                Send confirmation emails with QR codes to registered profiles
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {filteredProfiles.length} Profiles Found
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Input
              type="text"
              placeholder="Search by name, email address, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-1/3"
            />
            <div className="flex items-center gap-2">
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

              <Select
                value={genderFilter}
                onValueChange={(value) => {
                  setGenderFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-32">
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[60px]">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Anubandh ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading profiles...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No profiles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProfiles.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-slate-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(profile.id)}
                          onCheckedChange={() => toggleRowSelection(profile.id)}
                          aria-label={`Select ${profile.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {profile.anubandhId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 bg-slate-200">
                            <AvatarFallback>
                              {profile.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{profile.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            profile.gender === "MALE"
                              ? "bg-blue-50 text-blue-700"
                              : profile.gender === "FEMALE"
                              ? "bg-pink-50 text-pink-700"
                              : "bg-gray-50 text-gray-700"
                          }
                        >
                          {profile.gender === "MALE"
                            ? "Male"
                            : profile.gender === "FEMALE"
                            ? "Female"
                            : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{profile.mobileNumber}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            profile.approvalStatus ? "default" : "outline"
                          }
                          className={
                            profile.approvalStatus
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }
                        >
                          {profile.approvalStatus ? (
                            <div className="flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" />
                              Approved
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <X className="h-3.5 w-3.5" />
                              Pending
                            </div>
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
                  Page {currentPage} of {totalPages || 1}
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
        <CardFooter className="flex justify-between items-center border-t p-4">
          <div className="text-sm text-muted-foreground">
            {selectedRows.size} of {filteredProfiles.length} profiles selected
          </div>
          <Button
            onClick={openConfirmationDialog}
            disabled={selectedRows.size === 0 || isSending}
            className="flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isSending ? "Sending..." : "Send Emails"}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Email Sending</DialogTitle>
            <DialogDescription>
              You are about to send emails to {selectedRows.size} recipients.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <p>
                To confirm, type &quot;<span className="font-bold">send</span>
                &quot; in the box below:
              </p>
            </div>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type 'send' to confirm"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmails}
              disabled={confirmationText.toLowerCase() !== "send" || isSending}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isSending ? "Sending..." : "Confirm Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Sending Results</DialogTitle>
            <DialogDescription>
              {emailResults && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Sent: {emailResults.totalSent}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <X className="h-4 w-4 text-red-500" />
                    <span>Failed: {emailResults.totalFailed}</span>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {emailResults && (
            <div className="mt-4">
              <div className="rounded-md border max-h-[50vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Anubandh ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailResults.results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {result.success ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <Check className="h-4 w-4" />
                              Success
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              Failed
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{result.anubandhId}</TableCell>
                        <TableCell>{result.email}</TableCell>
                        <TableCell>
                          {result.success
                            ? "Email sent successfully"
                            : result.error}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={() => setShowResults(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

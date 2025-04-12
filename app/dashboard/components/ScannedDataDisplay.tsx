"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { getProfile, type Profile } from "@/app/actions/getProfile";
import { getApprovalStatus } from "@/app/actions/getApprovalStatus";
import { updateApprovalStatus } from "@/app/actions/updateApprovalStatus";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";

interface ScannedDataProps {
  scanResult: string;
  onReset: () => void;
}

export default function ScannedDataDisplay({
  scanResult,
  onReset,
}: ScannedDataProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [introductionStatus, setIntroductionStatus] = useState<boolean>(false);
  const [introductionChecked, setIntroductionChecked] =
    useState<boolean>(false);

  // Get user session to check role
  const userRole = session?.user?.role || "default";
  const isReadOnly = userRole === "readOnly";
  const canApprove = userRole === "admin" || userRole === "user";

  // Parse scan result and fetch profile when component mounts
  useEffect(() => {
    console.log("Component mounted with scanResult:", scanResult);
    try {
      // First try to parse as JSON
      const data = JSON.parse(scanResult);
      console.log("Parsed scan data:", data);

      // Extract anubandhId from the scan data using all possible field names
      // Support both new and legacy formats
      const anubandhId = data.id || data.anubandhId || data.anubandh_id;
      console.log("Extracted anubandhId:", anubandhId);

      if (!anubandhId) {
        console.error("No anubandh ID found in scan result");
        setSearchError("No anubandh ID found in scan result");
        return;
      }

      // If attendee count is available in QR data, use it
      if (data.attendees || data.attendeeCount) {
        const count = data.attendees || data.attendeeCount;
        console.log("Setting guest count from QR:", count);
        setGuestCount(Number(count));
      }

      // If name or other data is available in the QR, log it (useful for debugging)
      if (data.name) {
        console.log("Name from QR:", data.name);
      }
      if (data.mobile) {
        console.log("Mobile from QR:", data.mobile);
      }

      // Fetch profile data
      fetchProfileData(anubandhId);
    } catch (error) {
      // If JSON parsing fails, check if the scanResult itself could be an ID
      console.error("Error parsing scan result:", error);

      // More permissive regex to handle various ID formats
      if (
        typeof scanResult === "string" &&
        scanResult.trim() &&
        /^[A-Za-z0-9_-]{3,}$/.test(scanResult.trim())
      ) {
        // If scanResult matches pattern of an ID, try using it directly
        console.log(
          "Treating raw scan result as anubandhId:",
          scanResult.trim()
        );
        fetchProfileData(scanResult.trim());
      } else {
        setSearchError("Invalid QR code format. Please scan a valid QR code.");
      }
    }
  }, [scanResult]);

  // Set initial guest count when profile data is loaded
  useEffect(() => {
    if (profileData && profileData.attendeeCount) {
      setGuestCount(profileData.attendeeCount);
    }
    // Also set introduction status if available
    if (profileData && profileData.introductionStatus !== undefined) {
      setIntroductionStatus(!!profileData.introductionStatus);
    }
  }, [profileData]);

  // Function to fetch profile data
  const fetchProfileData = async (anubandhId: string) => {
    try {
      const profile = await getProfile(anubandhId);
      console.log("Profile data:", profile);
      setProfileData(profile);
      setApprovalStatus(profile.approvalStatus);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setSearchError("Failed to fetch profile data");
    }
  };

  const handleGuestCountChange = (value: number[]) => {
    const numValue = value[0];

    // Update the guest count
    setGuestCount(numValue);

    // Update profileData with the new guest count
    if (profileData) {
      setProfileData({
        ...profileData,
        attendeeCount: numValue,
      });
    }
  };

  const incrementGuestCount = () => {
    if (guestCount < 2) {
      const newCount = guestCount + 1;
      setGuestCount(newCount);

      if (profileData) {
        setProfileData({
          ...profileData,
          attendeeCount: newCount,
        });
      }
    }
  };

  const decrementGuestCount = () => {
    if (guestCount > 1) {
      const newCount = guestCount - 1;
      setGuestCount(newCount);

      if (profileData) {
        setProfileData({
          ...profileData,
          attendeeCount: newCount,
        });
      }
    }
  };

  const handleApproveProfile = async (): Promise<void> => {
    if (!profileData) {
      setSearchError("No profile selected for approval");
      return;
    }

    if (profileData.approvalStatus) {
      setSearchError("Profile is already approved");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the server action instead of fetch API
      const result = await updateApprovalStatus({
        anubandhId: profileData.anubandhId,
        attendeeCount: guestCount,
        introductionStatus: introductionStatus,
      });

      setProfileData({
        ...profileData,
        approvalStatus: true,
        attendeeCount: guestCount,
        introductionStatus: introductionStatus,
      });

      setApprovalStatus(true);
      toast.success("Profile approved successfully");

      setTimeout(() => {
        onReset();
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve entry";
      setSearchError(errorMessage);
      toast.error(errorMessage);
      console.error("Approval error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIntroduction = async (): Promise<void> => {
    if (!profileData) {
      setSearchError("No profile selected for introduction update");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the server action instead of fetch API
      const result = await updateApprovalStatus({
        anubandhId: profileData.anubandhId,
        attendeeCount: guestCount,
        introductionStatus: introductionChecked,
      });

      setProfileData({
        ...profileData,
        approvalStatus: true,
        attendeeCount: guestCount,
        introductionStatus: introductionChecked,
      });

      setApprovalStatus(true);
      toast.success("Introduction status updated successfully");

      setTimeout(() => {
        onReset();
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update introduction status";
      setSearchError(errorMessage);
      toast.error(errorMessage);
      console.error("Introduction status update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if profile is female based on gender field
  const isFemaleProfile = profileData?.gender?.toLowerCase() === "female";

  if (!profileData) {
    return (
      <Card className="mt-6 border-slate-200 shadow-md">
        <CardContent className="p-6 flex justify-center items-center">
          <p className="text-black">
            {searchError || "Loading profile data..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="bg-slate-50 border-b p-4 pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Profile Details</CardTitle>
            </div>
            <Badge
              variant={profileData.approvalStatus ? "secondary" : "outline"}
              className={`text-sm ${
                profileData.approvalStatus
                  ? "bg-green-50 text-green-700 hover:bg-green-50"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-50"
              }`}
            >
              {profileData.approvalStatus ? "Approved" : "Pending Approval"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-5">
            {/* Photo section - centered on mobile, left-aligned on desktop */}
            <div className="flex justify-center md:justify-start">
              {profileData.photo ? (
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-slate-200">
                  <AvatarImage
                    src={profileData.photo}
                    alt={`Photo of ${profileData.name}`}
                  />
                  <AvatarFallback>
                    {profileData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-slate-200">
                  <AvatarFallback>
                    <User className="h-8 w-8 md:h-10 md:w-10" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Profile information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-base">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profileData.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Anubandh ID:</p>
                <p className="font-medium">{profileData.anubandhId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-words">{profileData.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{profileData.mobileNumber}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">
                  {profileData.gender || "Not specified"}
                </p>
              </div>

              {profileData.dateOfBirth && (
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{profileData.dateOfBirth}</p>
                </div>
              )}

              {profileData.birthPlace && (
                <div>
                  <p className="text-sm text-muted-foreground">Birth Place</p>
                  <p className="font-medium">{profileData.birthPlace}</p>
                </div>
              )}

              {profileData.education && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Education</p>
                  <p className="font-medium">{profileData.education}</p>
                </div>
              )}

              {/* Guest Count section */}
              <div className="sm:col-span-2 mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Guest Count (Including Self)
                </p>

                {isFemaleProfile &&
                !isReadOnly &&
                !profileData.approvalStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={decrementGuestCount}
                        disabled={guestCount <= 1}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="font-medium text-center w-16">
                        {guestCount} {guestCount === 1 ? "Person" : "Persons"}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={incrementGuestCount}
                        disabled={guestCount >= 2}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="px-2">
                      <Slider
                        value={[guestCount]}
                        min={1}
                        max={2}
                        step={1}
                        onValueChange={handleGuestCountChange}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                        <span>1</span>
                        <span>2</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-medium">
                    {isFemaleProfile
                      ? profileData?.attendeeCount ?? 0
                      : (profileData?.attendeeCount ?? 1) - 1}{" "}
                    {(isFemaleProfile
                      ? profileData?.attendeeCount ?? 0
                      : (profileData?.attendeeCount ?? 1) - 1) === 1
                      ? "Person"
                      : "Persons"}
                    {!isFemaleProfile &&
                      !isReadOnly &&
                      !profileData.approvalStatus && (
                        <span className="text-xs text-amber-600 ml-2">
                          (Only female profiles can edit guest count)
                        </span>
                      )}
                  </p>
                )}
              </div>

              {/* Introduction Status */}
              <div className="sm:col-span-2 mt-2">
                {profileData.approvalStatus &&
                  profileData.introductionStatus && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Introduction Status
                      </p>
                      <p className="font-medium text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Interested for Introduction
                      </p>
                    </div>
                  )}

                {canApprove &&
                  (!profileData.approvalStatus ||
                    (profileData.approvalStatus &&
                      !profileData.introductionStatus)) && (
                    <div className="border-t pt-4 mt-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="introductionStatus"
                          checked={introductionStatus}
                          onCheckedChange={(checked) => {
                            setIntroductionStatus(!!checked);
                            setIntroductionChecked(!!checked);
                          }}
                          disabled={isReadOnly}
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor="introductionStatus"
                          className="font-medium cursor-pointer text-sm"
                        >
                          Interested for Introduction
                        </Label>
                      </div>
                      {!profileData.approvalStatus && (
                        <p className="text-gray-600 text-sm mt-2">
                          Introduction status will be saved when the entry is
                          approved
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Display error message if any */}
            {searchError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between space-x-3 p-4 sm:p-6 border-t">
          {!isReadOnly && (
            <Button onClick={onReset} variant="outline" className="h-10 gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Scan New</span>
            </Button>
          )}

          <div className="flex gap-2">
            {/* Show approve button for profiles that are not approved */}
            {canApprove && !profileData.approvalStatus && (
              <Button
                onClick={handleApproveProfile}
                disabled={isSubmitting}
                className="gap-2 bg-green-600 hover:bg-green-700 text-sm h-12 px-5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Approve Entry
                  </>
                )}
              </Button>
            )}

            {/* Show update introduction status button for approved profiles without introduction status */}
            {canApprove &&
              profileData.approvalStatus &&
              !profileData.introductionStatus && (
                <Button
                  onClick={handleUpdateIntroduction}
                  disabled={isSubmitting}
                  className="gap-1 md:gap-2 bg-blue-600 hover:bg-blue-700 text-xs md:text-sm h-9 md:h-12 px-3 md:px-5 w-full md:w-auto flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                      <span className="hidden xs:inline">Processing...</span>
                      <span className="xs:hidden">Processing</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden xs:inline">
                        Set Introduction Status
                      </span>
                      <span className="xs:hidden">Update Status</span>
                    </>
                  )}
                </Button>
              )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

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
import { User, CheckCircle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { getProfile, type Profile } from "@/app/actions/getProfile";
import { getApprovalStatus } from "@/app/actions/getApprovalStatus";
import { updateApprovalStatus } from "@/app/actions/updateApprovalStatus";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

  const handleGuestCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const value = e.target.value.replace(/\D/g, "");

    // Parse to number
    const numValue = value === "" ? 1 : parseInt(value, 10);

    // Validate range (1-10)
    if (numValue >= 1 && numValue <= 10) {
      setGuestCount(numValue);

      // Update profileData with the new guest count
      if (profileData) {
        setProfileData({
          ...profileData,
          attendeeCount: numValue,
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

  if (!profileData) {
    return (
      <Card className="mt-6 border-slate-200">
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
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-xl">
              {profileData.name}{" "}
              {profileData.approvalStatus ? (
                <span className="text-green-600 text-sm">
                  (Already Approved)
                </span>
              ) : (
                <span className="text-red-600 text-sm">(Not Approved)</span>
              )}
            </CardTitle>
            <CardDescription>
              {profileData.mobileNumber} - {profileData.anubandhId}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {!isReadOnly && (
              <Button
                onClick={onReset}
                variant="outline"
                className="h-8 rounded-md"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">
                Guest Count (Including Self)
              </h4>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={guestCount}
                  onChange={handleGuestCountChange}
                  className="max-w-[80px]"
                  disabled={isReadOnly}
                  min={1}
                  max={10}
                />
                <Label>Persons</Label>
              </div>
            </div>

            {/* Introduction Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="introductionStatus"
                checked={introductionStatus}
                onCheckedChange={(checked) => {
                  setIntroductionStatus(!!checked);
                  setIntroductionChecked(!!checked);
                }}
                disabled={isReadOnly}
              />
              <label
                htmlFor="introductionStatus"
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Introduction Status
              </label>
            </div>

            {/* Display error message if any */}
            {searchError && <p className="text-red-500">{searchError}</p>}

            {/* Approval buttons - hidden for readOnly */}
            {canApprove && (
              <div className="flex flex-col space-y-2 pt-2">
                <Button
                  onClick={handleApproveProfile}
                  disabled={profileData.approvalStatus || isSubmitting}
                  className={`w-full ${
                    profileData.approvalStatus
                      ? "bg-green-100 text-green-800 hover:bg-green-100 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : profileData.approvalStatus ? (
                    "Already Approved"
                  ) : (
                    "Approve Entry"
                  )}
                </Button>

                {profileData.approvalStatus && (
                  <Button
                    onClick={handleUpdateIntroduction}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Update Introduction Status"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, CheckCircle } from "lucide-react";
import { getProfile, type Profile } from "@/app/actions/getProfile";
import { getApprovalStatus } from "@/app/actions/getApprovalStatus";
import { updateApprovalStatus } from "@/app/actions/updateApprovalStatus";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ScannedDataProps {
  scanResult: string;
  onReset: () => void;
}

export default function ScannedDataDisplay({
  scanResult,
  onReset,
}: ScannedDataProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [introductionStatus, setIntroductionStatus] = useState<boolean>(false);

  // Parse scan result and fetch profile when component mounts
  useEffect(() => {
    console.log("Component mounted with scanResult:", scanResult);
    try {
      const data = JSON.parse(scanResult);
      console.log("Parsed scan data:", data);

      // Extract anubandhId from the scan data
      const anubandhId = data.anubandh_id || data.anubandhId;
      console.log("Extracted anubandhId:", anubandhId);

      if (!anubandhId) {
        setSearchError("No anubandh ID found in scan result");
        return;
      }

      // Fetch profile data
      fetchProfileData(anubandhId);
    } catch (error) {
      console.error("Error parsing scan result:", error);
      setSearchError("Invalid QR code data format");
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
        error instanceof Error ? error.message : "Failed to approve profile";
      setSearchError(errorMessage);
      toast.error(errorMessage);
      console.error("Approval error:", error);
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
    <Card className="mt-6 border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Profile Details</CardTitle>
          <Badge
            variant={profileData.approvalStatus ? "secondary" : "outline"}
            className={
              profileData.approvalStatus
                ? "bg-green-50 text-green-700 hover:bg-green-50"
                : "bg-amber-50 text-amber-700 hover:bg-amber-50"
            }
          >
            {profileData.approvalStatus ? "Approved" : "Pending Approval"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-center md:justify-start">
            {profileData.photo ? (
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-slate-200">
                <AvatarImage
                  src={profileData.photo}
                  alt={`Photo of ${profileData.name}`}
                />
                <AvatarFallback>
                  {profileData.name?.substring(0, 2).toUpperCase() || "NA"}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{profileData.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium break-words">{profileData.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-medium">{profileData.mobileNumber}</p>
            </div>

            {profileData.dateOfBirth && (
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {new Date(profileData.dateOfBirth).toLocaleDateString(
                    "en-GB"
                  )}
                </p>
              </div>
            )}

            {profileData.birthTime && (
              <div>
                <p className="text-sm text-muted-foreground">Birth Time</p>
                <p className="font-medium">{profileData.birthTime}</p>
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

            {profileData.attendeeCount && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Guest Count</p>
                <p className="font-medium">{profileData.attendeeCount}</p>
              </div>
            )}
            {/* <div className="sm:col-span-2">
              <Label
                htmlFor="guestCount"
                className="text-sm text-muted-foreground"
              >
                Guest Count (Max 10)
              </Label>
              {!profileData.approvalStatus ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="guestCount"
                    type="text"
                    value={guestCount}
                    onChange={handleGuestCountChange}
                    className="w-24"
                    maxLength={2}
                    pattern="[1-9]|10"
                    inputMode="numeric"
                  />
                  <span className="text-sm text-muted-foreground">persons</span>
                </div>
              ) : (
                <p className="font-medium mt-1">
                  {profileData.attendeeCount || 1} persons
                </p>
              )}
            </div> */}

            {/* Only show the introduction checkbox if profile is not yet approved */}
            {!profileData.approvalStatus && (
              <div className="sm:col-span-2">
                <div className="flex items-center space-x-2 mt-3">
                  <Checkbox
                    id="introductionStatus"
                    checked={introductionStatus}
                    onCheckedChange={(checked) => {
                      setIntroductionStatus(checked === true);
                    }}
                  />
                  <Label
                    htmlFor="introductionStatus"
                    className="font-medium cursor-pointer"
                  >
                    Interested for Introduction
                  </Label>
                </div>
              </div>
            )}

            {/* If profile is already approved and has introduction status, show it as text */}
            {profileData.approvalStatus && profileData.introductionStatus && (
              <div className="sm:col-span-2">
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">
                    Introduction Status
                  </p>
                  <p className="font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Interested for Introduction
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {searchError && (
        <div className="px-6 pb-4">
          <p className="text-red-500">{searchError}</p>
        </div>
      )}

      {!profileData.approvalStatus && (
        <CardFooter className="flex justify-end pt-2 pb-4">
          <Button
            onClick={handleApproveProfile}
            disabled={isSubmitting}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            {isSubmitting ? "Approving..." : "Approve Profile"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

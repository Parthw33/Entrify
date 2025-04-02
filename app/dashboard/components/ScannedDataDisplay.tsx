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
import Image from "next/image";
import { Badge, CheckCircle, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

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
  const parsedData = JSON.parse(scanResult);
  const { anubandh_id } = parsedData;

  // Fetch approval status when component mounts
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      try {
        const response = await fetch(
          `/api/userEntry?anubandh_id=${anubandh_id}`
        );
        if (!response.ok) throw new Error("Failed to fetch approval status");

        const data = await response.json();
        setApprovalStatus(data.approvalStatus);
      } catch (error) {
        console.error("Error fetching approval status:", error);
      }
    };

    fetchApprovalStatus();
  }, [anubandh_id]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/userEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...parsedData, approvalStatus: true }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      alert("User approved successfully!");
      setApprovalStatus(true); // Update status in UI
      onReset();
    } catch (error) {
      console.error("Error:", error);
      alert("Error approving user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status is considered pending when it's false or null
  const isPending = approvalStatus === false || approvalStatus === null;

  return (
    <Card className="mt-6 border-slate-200">
      <CardHeader className="pb-2 flex justify-center">
        <div className="flex flex-col items-center">
          <CardTitle className="text-3xl">{parsedData.name}</CardTitle>
          {/* <Badge
            variant={parsedData.approvalStatus ? "secondary" : "outline"}
            className={
              parsedData.approvalStatus
                ? "bg-green-50 text-green-700 hover:bg-green-50"
                : "bg-amber-50 text-amber-700 hover:bg-amber-50"
            }
          >
            {parsedData.approvalStatus ? "Approved" : "Pending Approval"}
          </Badge> */}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          {/* Profile information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{parsedData.name}</p>
            </div> */}

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium break-words">{parsedData.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-medium">{parsedData.mobile}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {new Date(parsedData.dob).toLocaleDateString("en-GB")}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Birth Time</p>
              <p className="font-medium">{parsedData.birthTime}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Birth Place</p>
              <p className="font-medium">{parsedData.birthPlace}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Education</p>
              <p className="font-medium">{parsedData.education}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Attendee Count:-</p>
              <p className="font-medium">{parsedData.attendeeCount}</p>
            </div>
          </div>
        </div>
      </CardContent>

      {!parsedData.approvalStatus && (
        <CardFooter className="flex justify-end pt-2 pb-4">
          <Button
            onClick={handleApprove}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Approve Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

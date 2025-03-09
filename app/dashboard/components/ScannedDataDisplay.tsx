"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Scanned QR Code Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {parsedData.image_url && (
          <div className="flex justify-center mb-4">
            <Image
              src={parsedData.image_url}
              alt={`Photo of ${parsedData.name}`}
              width={200}
              height={200}
              className="rounded-md object-cover"
            />
          </div>
        )}

        <div className="space-y-2">
          <p>
            <strong>ID:</strong> {parsedData.anubandh_id}
          </p>
          <p>
            <strong>Name:</strong> {parsedData.name}
          </p>
          <p>
            <strong>Mobile:</strong> {parsedData.mobile}
          </p>
          <p>
            <strong>DOB:</strong> {parsedData.dob}
          </p>
          <p>
            <strong>Email:</strong> {parsedData.email}
          </p>
          <p>
            <strong>Birth Time:</strong> {parsedData.birth_time}
          </p>
          <p>
            <strong>Birth Place:</strong> {parsedData.birth_place}
          </p>
          <p>
            <strong>Education:</strong> {parsedData.education}
          </p>
          <p>
            <strong>About:</strong> {parsedData.about}
          </p>
          <p>
            <strong>Approval Status:</strong>{" "}
            <span
              className={`font-semibold ${
                approvalStatus === true ? "text-green-600" : "text-red-600"
              }`}
            >
              {approvalStatus === true ? "Approved" : "Pending"}
            </span>
          </p>
        </div>

        <div className="flex justify-between mt-6">
          {isPending ? (
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Approve"}
            </Button>
          ) : (
            <Button
              disabled
              className="bg-green-600 opacity-50 cursor-not-allowed text-white"
            >
              Approved
            </Button>
          )}
          <Button onClick={onReset} variant="outline">
            Scan Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

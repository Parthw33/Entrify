"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScannedDataProps {
  scanResult: string;
  onReset: () => void;
}

export default function ScannedDataDisplay({
  scanResult,
  onReset,
}: ScannedDataProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const parsedData = JSON.parse(scanResult);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/userEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) throw new Error("Failed to submit");

      alert("User approved successfully!");
      onReset();
    } catch (error) {
      console.error("Error:", error);
      alert("Error approving user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scanned QR Code Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
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
        </div>
        <div className="flex space-x-4">
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Approve"}
          </Button>
          <Button variant="outline" onClick={onReset}>
            Scan Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

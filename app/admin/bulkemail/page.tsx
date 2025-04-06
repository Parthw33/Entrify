"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BulkEmailTable from "../components/bulkEmailTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BulkEmail() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check for permissions and redirect if necessary
  useEffect(() => {
    if (!session && status !== "loading") {
      // Redirect if not authenticated
      toast.error("Please login to access this page");
      router.push("/");
      return;
    }

    // Only allow admin role
    if (status === "authenticated" && session?.user?.role !== "admin") {
      toast.error("You don't have permission to access this page.");
      router.push("/admin");
    }
  }, [status, session, router]);

  // Show loading or unauthorized message if not ready
  if (status === "loading") {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Unauthorized Access</h2>
            <p className="text-muted-foreground">
              You don{"'"}t have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </Link>
      </div>

      <Card className="mt-6 border shadow-sm">
        <CardHeader className="bg-slate-50 border-b flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bulk Email Sender</CardTitle>
              <CardDescription>
                Send confirmation emails with QR codes to multiple participants
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Mail className="h-4 w-4 mr-1.5" />
              Email Utility
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-blue-800">
          Select profiles from the table below and click &quot;Send Emails&quot;
          to send confirmation emails with QR codes. Each email will include a
          personalized QR code for event check-in.
        </p>
      </div>

      <BulkEmailTable />
    </div>
  );
}

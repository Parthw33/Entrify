"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PandharpurTable from "./pandharpurTable";
import {
  PandharpurProfileData,
  getPandharpurProfiles,
} from "@/app/actions/getPandharpurProfiles";
import { useState, useEffect } from "react";

export default function PandharpurTableWithSkeleton() {
  const [profiles, setProfiles] = useState<PandharpurProfileData[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Function to fetch profiles data that can be called whenever needed
  const fetchProfiles = async () => {
    setIsTableLoading(true);
    try {
      const data = await getPandharpurProfiles();
      setProfiles(data.profiles);
    } catch (error) {
      console.error("Error fetching Pandharpur profiles:", error);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  if (isTableLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pandharpur Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-2">
              <div className="flex gap-4 py-3">
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <PandharpurTable profiles={profiles} refetchData={fetchProfiles} />;
}

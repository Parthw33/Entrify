import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getProfileStats } from "@/app/actions/getProfileStats";
import { toast } from "sonner";

interface StatsProps {
  onApprovedClick: () => void;
}

export default function StatCards({ onApprovedClick }: StatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    approvedFemaleStats: 0,
    approvedMaleStats: 0,
    totalMaleStats: 0,
    totalFemaleStats: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const data = await getProfileStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching profile stats:", error);
        toast.error("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm border overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mt-2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Profiles Card */}
      <Card className="shadow-sm border overflow-hidden">
        <CardHeader className="pb-2 bg-slate-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Total Profiles
            </CardTitle>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            <div className="flex gap-2 mt-2 text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Male: {stats.totalMaleStats}
              </Badge>
              <Badge variant="outline" className="bg-pink-50 text-pink-700">
                Female: {stats.totalFemaleStats}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved Profiles Card */}
      <Card
        className="shadow-sm border overflow-hidden transition-colors hover:border-green-200 cursor-pointer"
        onClick={onApprovedClick}
      >
        <CardHeader className="pb-2 bg-slate-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Approved Profiles
            </CardTitle>
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-green-700">
              {stats.approved}
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({Math.round((stats.approved / stats.total) * 100) || 0}%)
              </span>
            </p>
            <div className="flex gap-2 mt-2 text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Male: {stats.approvedMaleStats}
              </Badge>
              <Badge variant="outline" className="bg-pink-50 text-pink-700">
                Female: {stats.approvedFemaleStats}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Profiles Card */}
      <Card className="shadow-sm border overflow-hidden">
        <CardHeader className="pb-2 bg-slate-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Pending Approval
            </CardTitle>
            <UserX className="h-6 w-6 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-amber-700">
              {stats.pending}
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({Math.round((stats.pending / stats.total) * 100) || 0}%)
              </span>
            </p>
            <div className="flex gap-2 mt-2 text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Male: {stats.totalMaleStats - stats.approvedMaleStats}
              </Badge>
              <Badge variant="outline" className="bg-pink-50 text-pink-700">
                Female: {stats.totalFemaleStats - stats.approvedFemaleStats}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

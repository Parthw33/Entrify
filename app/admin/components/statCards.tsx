import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfileStats } from "@/app/actions/getProfileStats";

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
        console.log("Fetched stats:", data);
        setStats(data);
      } catch (error) {
        console.error("Error fetching profile stats:", error);
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
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 flex items-center gap-4">
        <Users className="h-10 w-10 text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold">Total Profiles</h3>
          <p className="text-xl font-bold">
            {stats.total} (M: {stats.totalMaleStats}, F:{" "}
            {stats.totalFemaleStats})
          </p>
        </div>
      </Card>

      <Card
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
        onClick={onApprovedClick}
      >
        <UserCheck className="h-10 w-10 text-green-500" />
        <div>
          <h3 className="text-lg font-semibold">Approved</h3>
          <p className="text-xl font-bold">
            {stats.approved} (M: {stats.approvedMaleStats}, F:{" "}
            {stats.approvedFemaleStats})
          </p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-4">
        <UserX className="h-10 w-10 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold">Pending Approval</h3>
          <p className="text-xl font-bold">
            {stats.pending} (M: {stats.totalMaleStats - stats.approvedMaleStats}
            , F: {stats.totalFemaleStats - stats.approvedFemaleStats})
          </p>
        </div>
      </Card>
    </div>
  );
}

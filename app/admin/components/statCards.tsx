import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsProps {
  onApprovedClick: () => void;
}

export default function StatCards({ onApprovedClick }: StatsProps) {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/profiles/stats");
        const data = await res.json();
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
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
      </Card>

      <Card
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
        onClick={onApprovedClick}
      >
        <UserCheck className="h-10 w-10 text-green-500" />
        <div>
          <h3 className="text-lg font-semibold">Approved</h3>
          <p className="text-xl font-bold">{stats.approved}</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-4">
        <UserX className="h-10 w-10 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold">Pending Approval</h3>
          <p className="text-xl font-bold">{stats.pending}</p>
        </div>
      </Card>
    </div>
  );
}

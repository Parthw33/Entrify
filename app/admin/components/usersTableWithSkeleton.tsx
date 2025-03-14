import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UserTable from "./allUserTable";
import { Profile } from "./approvedProfileRow";
import { useState, useEffect } from "react";

export default function UsersTableWithSkeleton() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setIsTableLoading(true);
      try {
        const res = await fetch("/api/profiles/users");
        const data = await res.json();
        setUsers(data.allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsTableLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (isTableLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Registered Users</CardTitle>
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

  return <UserTable users={users} />;
}

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UserTable from "./allUserTable";
import { Profile, Profile1 } from "./approvedProfileRow";
import { useState, useEffect } from "react";
import { getAllUsers } from "@/app/actions/getAllUsers";

export default function UsersTableWithSkeleton() {
  const [users, setUsers] = useState<Profile1[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Function to fetch users data that can be called whenever needed
  const fetchUsers = async () => {
    setIsTableLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
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

  return <UserTable users={users} refetchData={fetchUsers} />;
}

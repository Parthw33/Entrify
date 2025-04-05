"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getUsers, updateUserRole, User } from "@/app/actions/userActions";

export default function ManageUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "loading") {
      return; // Wait for auth state to load
    }

    if (status === "unauthenticated" || !session) {
      toast.error("Please login to access this page");
      router.push("/");
      return;
    }

    if (session.user.role !== "admin") {
      toast.error("You do not have permission to access this page");
      router.push("/");
      return;
    }

    fetchUsers();
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsers();
      setUsers(result.users);

      // Initialize selected roles
      const initialRoles: Record<string, string> = {};
      result.users.forEach((user: User) => {
        initialRoles[user.email] = user.role;
      });
      setSelectedRole(initialRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (email: string, role: string) => {
    setSelectedRole((prev) => ({
      ...prev,
      [email]: role,
    }));
  };

  const handleUpdateRole = async (email: string) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("role", selectedRole[email]);

    startTransition(async () => {
      try {
        await updateUserRole(formData);
        toast.success(`Updated ${email}'s role to ${selectedRole[email]}`);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error("Error updating role:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update role"
        );
      }
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 min-h-screen">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          Loading user management...
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Manage User Roles
      </h1>

      {/* Table Container with fixed height and scrollable body */}
      <div className="bg-white rounded-lg shadow border">
        <div className="overflow-x-auto w-full">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell w-[30%]"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]"
                    >
                      New Role
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 sm:hidden truncate">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "user"
                                ? "bg-green-100 text-green-800"
                                : user.role === "readOnly"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={selectedRole[user.email]}
                            onChange={(e) =>
                              handleRoleChange(user.email, e.target.value)
                            }
                            className="block w-full py-1.5 px-2 text-sm border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="default">Default</option>
                            <option value="readOnly">Read Only</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <button
                            onClick={() => handleUpdateRole(user.email)}
                            disabled={
                              user.role === selectedRole[user.email] ||
                              isPending
                            }
                            className={`text-white py-1.5 px-3 rounded-md w-full sm:w-auto ${
                              user.role === selectedRole[user.email] ||
                              isPending
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {isPending ? "..." : "Update"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Swipe left/right to view more columns on mobile devices</p>
      </div>
    </div>
  );
}

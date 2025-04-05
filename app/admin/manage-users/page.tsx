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
      <div className="container mx-auto p-6 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Loading user management...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manage User Roles</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={selectedRole[user.email]}
                      onChange={(e) =>
                        handleRoleChange(user.email, e.target.value)
                      }
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="default">Default</option>
                      <option value="readOnly">Read Only</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleUpdateRole(user.email)}
                      disabled={
                        user.role === selectedRole[user.email] || isPending
                      }
                      className={`text-white py-1 px-3 rounded-md ${
                        user.role === selectedRole[user.email] || isPending
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isPending ? "Updating..." : "Update"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

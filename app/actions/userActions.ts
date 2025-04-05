'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export async function getUsers() {
  try {
    // Check if the current user is authenticated and is an admin
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        email: "asc",
      },
    });

    // Ensure email is not null for our interface
    const typedUsers: User[] = users.map(user => ({
      ...user,
      email: user.email || '',
    }));

    return { users: typedUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to fetch users");
  }
}

export async function updateUserRole(formData: FormData) {
  try {
    // Check if the current user is authenticated and is an admin
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Parse the form data
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (!email || !role) {
      throw new Error("Email and role are required");
    }

    // Validate role
    if (!["admin", "user", "readOnly", "default"].includes(role)) {
      throw new Error("Invalid role. Must be admin, user, readOnly, or default");
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: { email: true, role: true }
    });

    // Revalidate the manage users page
    revalidatePath('/admin/manage-users');

    return {
      success: true,
      message: `User ${email} role updated to ${role}`,
      user: updatedUser
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update user role");
  }
} 
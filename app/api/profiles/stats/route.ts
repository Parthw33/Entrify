import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalProfiles = await prisma.profile.count();
    const approvedProfiles = await prisma.profile.count({
      where: { approvalStatus: true },
    });
    const pendingProfiles = totalProfiles - approvedProfiles;

    return NextResponse.json({
      total: totalProfiles,
      approved: approvedProfiles,
      pending: pendingProfiles,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    );
  }
}

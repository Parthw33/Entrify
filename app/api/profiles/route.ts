export const dynamic = "force-dynamic"; 

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    let profiles;
    if (status === "all") {
      profiles = await prisma.profile.findMany();
    } else if (status === "approved") {
      profiles = await prisma.profile.findMany({
        where: { approvalStatus: true },
      });
    } else if (status === "pending") {
      profiles = await prisma.profile.findMany({
        where: { approvalStatus: false },
      });
    } else {
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
    }

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}

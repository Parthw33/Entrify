import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing anubandh_id" }, { status: 400 });
    }

    const profile = await prisma.profile.update({
      where: { anuBandhId: id },
      data: { approvalStatus: true },
    });

    return NextResponse.json({ message: "User approved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

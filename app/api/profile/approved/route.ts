import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const POST = async (req: NextRequest) => {
  try {

    await prisma.$connect();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing anubandh_id" }, { status: 400 });
    }

    const profile = await prisma.profileCsv.update({
      where: { anubandhId: id },
      data: { approvalStatus: true },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return NextResponse.json({ message: "User approved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

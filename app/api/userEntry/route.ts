import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const anubandh_id = url.searchParams.get("anubandh_id");

    if (!anubandh_id) {
      return NextResponse.json({ error: "Missing anubandh_id" }, { status: 400 });
    }

    console.log("Fetching user:", anubandh_id);

    // ✅ Use the correct field name: "anuBandhId"
    const user = await prisma.profileCsv.findUnique({
      where: { anubandhId: anubandh_id }, // Correct field name
      select: { approvalStatus: true },
    });

    if (!user) {
      console.log("User not found in DB");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ approvalStatus: user.approvalStatus });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anubandh_id } = body; // Extract anubandh_id from request body

    if (!anubandh_id) {
      return NextResponse.json({ error: "Missing anubandh_id" }, { status: 400 });
    }

    console.log("Updating approval status for:", anubandh_id);

    const updatedUser = await prisma.profileCsv.update({
      where: { anubandhId: anubandh_id },
      data: { approvalStatus: true }, // ✅ Update status to true
    });

    return NextResponse.json({ message: "User approved successfully", user: updatedUser });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to update approval status" }, { status: 500 });
  }
}
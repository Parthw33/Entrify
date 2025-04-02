import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    await prisma.profileCsv.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting all records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete all records" },
      { status: 500 }
    );
  }
}

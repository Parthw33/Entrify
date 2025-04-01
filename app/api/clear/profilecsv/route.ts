// src/app/api/clear/profilecsv/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  try {
    // Delete all records from the profileCsv collection
    const deleteResult = await prisma.profileCsv.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} profiles from the collection`,
      count: deleteResult.count
    });
  } catch (error) {
    console.error("Error clearing collection:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to clear collection", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
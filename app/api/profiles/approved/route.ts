
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const profiles = await prisma.profileCsv.findMany({
      where: {
        approvalStatus: true
      },
      select: {
        id: true,
        anubandhId: true,
        name: true,
        mobileNumber: true,
        email: true,
        dateOfBirth: true,
        birthTime: true,
        birthPlace: true,
        education: true,
        createdAt: true,
        updatedAt: true,
        approvalStatus: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Return the profiles with NextResponse
    return NextResponse.json({ 
      profiles,
      total: profiles.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching approved profiles:', error);
    return NextResponse.json({ 
      message: 'Failed to fetch approved profiles',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
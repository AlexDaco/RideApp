import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateAverage } from "@/lib/functional";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      motorcycle: true,
      createdAt: true,
      rides: {
        select: { id: true, title: true, startAddress: true, endAddress: true, distance: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      ratingsReceived: {
        select: {
          id: true,
          speedScore: true,
          safetyScore: true,
          comment: true,
          createdAt: true,
          fromUser: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Fahrer nicht gefunden" }, { status: 404 });
  }

  const profile = {
    ...user,
    avgSpeed: calculateAverage(user.ratingsReceived.map((r) => r.speedScore)),
    avgSafety: calculateAverage(user.ratingsReceived.map((r) => r.safetyScore)),
    ratingCount: user.ratingsReceived.length,
    rideCount: user.rides.length,
  };

  return NextResponse.json(profile);
}

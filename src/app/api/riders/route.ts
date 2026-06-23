import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateAverage } from "@/lib/functional";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      motorcycle: true,
      createdAt: true,
      _count: { select: { rides: true } },
      ratingsReceived: { select: { speedScore: true, safetyScore: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const riders = users.map((user) => ({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    motorcycle: user.motorcycle,
    createdAt: user.createdAt,
    rideCount: user._count.rides,
    avgSpeed: calculateAverage(user.ratingsReceived.map((r) => r.speedScore)),
    avgSafety: calculateAverage(user.ratingsReceived.map((r) => r.safetyScore)),
    ratingCount: user.ratingsReceived.length,
  }));

  return NextResponse.json(riders);
}

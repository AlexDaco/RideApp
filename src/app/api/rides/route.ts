import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rideSchema } from "@/lib/validations";

export async function GET() {
  const rides = await prisma.ride.findMany({
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(rides);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = rideSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  const ride = await prisma.ride.create({
    data: { ...parsed.data, userId: session.user.id },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });

  return NextResponse.json(ride, { status: 201 });
}

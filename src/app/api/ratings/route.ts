import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ratingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ratingSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  const { toUserId, speedScore, safetyScore, comment } = parsed.data;

  if (toUserId === session.user.id) {
    return NextResponse.json({ error: "Du kannst dich nicht selbst bewerten" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "Fahrer nicht gefunden" }, { status: 404 });
  }

  const rating = await prisma.rating.upsert({
    where: { fromUserId_toUserId: { fromUserId: session.user.id, toUserId } },
    update: { speedScore, safetyScore, comment },
    create: { fromUserId: session.user.id, toUserId, speedScore, safetyScore, comment },
  });

  return NextResponse.json(rating, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const { userId } = await params;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: session.user.id, toUserId: userId },
        { fromUserId: userId, toUserId: session.user.id },
      ],
    },
    include: {
      fromUser: { select: { id: true, username: true } },
      toUser: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { fromUserId: userId, toUserId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json(messages);
}

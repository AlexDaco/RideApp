import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { messageSchema } from "@/lib/validations";
import { uniqueBy } from "@/lib/functional";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }],
    },
    include: {
      fromUser: { select: { id: true, username: true, avatarUrl: true } },
      toUser: { select: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversations = uniqueBy(
    messages.map((m) => {
      const other = m.fromUserId === session.user!.id ? m.toUser : m.fromUser;
      return {
        userId: other.id,
        username: other.username,
        avatarUrl: other.avatarUrl,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unread: m.toUserId === session.user!.id && !m.read,
      };
    }),
    (c) => c.userId
  );

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  const { toUserId, content } = parsed.data;

  if (toUserId === session.user.id) {
    return NextResponse.json({ error: "Du kannst dir nicht selbst schreiben" }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!recipient) {
    return NextResponse.json({ error: "Empfänger nicht gefunden" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: { fromUserId: session.user.id, toUserId, content },
    include: {
      fromUser: { select: { id: true, username: true } },
      toUser: { select: { id: true, username: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}

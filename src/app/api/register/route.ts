import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  const { email, username, password } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    const field = existingUser.email === email ? "E-Mail" : "Benutzername";
    return NextResponse.json(
      { error: `${field} ist bereits vergeben` },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  });

  return NextResponse.json(
    { id: user.id, email: user.email, username: user.username },
    { status: 201 }
  );
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  if (user.blocked) return NextResponse.json({ error: 'Account is blocked' }, { status: 403 });

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  const token = signToken({ userId: user.id, role: user.role, email: user.email, name: user.name });
  setSessionCookie(token);
  return NextResponse.json({ ok: true, role: user.role });
}

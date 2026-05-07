import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const { secret } = await request.json();

  const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  revalidatePath('/pl');
  revalidatePath('/en');
  revalidatePath('/pl/contact');
  revalidatePath('/en/contact');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

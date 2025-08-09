
import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GIST_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'GitHub token not configured on the server.' }, { status: 500 });
  }
  return NextResponse.json({ token });
}

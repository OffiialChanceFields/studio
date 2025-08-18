import { NextResponse } from 'next/server';
import { getGitHubToken } from '@/lib/github/gist';

export async function GET() {
  try {
    const token = getGitHubToken();
    return NextResponse.json({ hasToken: !!token, token: token });
  } catch (error) {
    console.error("Error reading GIST_TOKEN:", error);
    return NextResponse.json({ hasToken: false, error: 'Could not read server configuration.' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const envFilePath = path.resolve(process.cwd(), '.env');
const GITHUB_API_URL = 'https://api.github.com';

// This is a placeholder for a more secure way to store and retrieve the token.
let storedToken: string | null = null;

async function getGistToken() {
  try {
    const envFileContent = await fs.readFile(envFilePath, 'utf-8');
    const match = envFileContent.match(/^GIST_TOKEN=(.*)$/m);
    return match ? match[1] : null;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // .env file doesn't exist
    }
    throw error;
  }
}

export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        if (typeof token !== 'string') {
            return NextResponse.json({ error: 'Invalid token format.' }, { status: 400 });
        }
        storedToken = token;
        return NextResponse.json({ message: 'Token stored successfully.' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
    }
}

export async function GET() {
  try {
    const token = storedToken || await getGistToken();
    return NextResponse.json({ hasToken: !!token });
  } catch (error) {
    console.error("Error reading GIST_TOKEN from .env file:", error);
    return NextResponse.json({ error: 'Could not read server configuration.' }, { status: 500 });
  }
}

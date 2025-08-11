
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const envFilePath = path.resolve(process.cwd(), '.env');

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

async function setGistToken(token: string) {
  let envFileContent = '';
  try {
    envFileContent = await fs.readFile(envFilePath, 'utf-8');
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (envFileContent.includes('GIST_TOKEN')) {
    envFileContent = envFileContent.replace(/^GIST_TOKEN=.*$/m, `GIST_TOKEN=${token}`);
  } else {
    envFileContent += `\nGIST_TOKEN=${token}`;
  }
  await fs.writeFile(envFilePath, envFileContent.trim());
}


export async function GET() {
  try {
    const token = await getGistToken();
    if (token) {
        return NextResponse.json({ token: token });
    }
    return NextResponse.json({ token: null });
  } catch (error) {
    console.error("Error reading GIST_TOKEN from .env file:", error);
    return NextResponse.json({ error: 'Could not read server configuration.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Invalid token provided.' }, { status: 400 });
        }
        await setGistToken(token);
        // We do not recommend restarting the server automatically in production.
        // For development, a manual restart is safer. For production, environment variables
        // should be managed by the hosting platform.
        return NextResponse.json({ message: 'Token updated. Please restart the server for changes to take effect if in a local environment.' });
    } catch (error) {
        console.error("Error writing GIST_TOKEN to .env file:", error);
        return NextResponse.json({ error: 'Failed to save token on the server.' }, { status: 500 });
    }
}

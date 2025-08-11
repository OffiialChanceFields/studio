
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Workspace } from '@/store/slices/workspaceSlice';

const envFilePath = path.resolve(process.cwd(), '.env');
const GITHUB_API_URL = 'https://api.github.com';
export const GIST_FILENAME = process.env.NEXT_PUBLIC_GIST_FILE_NAME || 'GeminiVaultAgentMemory.json';


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

export async function GET() {
  try {
    const token = await getGistToken();
    return NextResponse.json({ hasToken: !!token });
  } catch (error) {
    console.error("Error reading GIST_TOKEN from .env file:", error);
    return NextResponse.json({ error: 'Could not read server configuration.' }, { status: 500 });
  }
}

async function createGistOnServer(workspace: Workspace): Promise<string> {
    const token = process.env.GIST_TOKEN;
    if (!token) {
        throw new Error('GIST_TOKEN is not configured on the server.');
    }
    const content = JSON.stringify(workspace);

    const response = await fetch(`${GITHUB_API_URL}/gists`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: `HAR2LoliCode Analysis Session - ${workspace.name}`,
            public: false,
            files: {
                [GIST_FILENAME]: {
                    content: content,
                },
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create Gist:', errorData);
        throw new Error(`Failed to create Gist: ${errorData.message}`);
    }

    const gistData = await response.json();
    return gistData.id;
}


export async function POST(request: Request) {
    try {
        const workspace = await request.json() as Workspace;
        if (!workspace || !workspace.name || !workspace.harEntries) {
            return NextResponse.json({ error: 'Invalid workspace data provided.' }, { status: 400 });
        }
        const gistId = await createGistOnServer(workspace);
        return NextResponse.json({ gistId });
    } catch (error: any) {
        console.error("Error creating Gist:", error);
        return NextResponse.json({ error: error.message || 'Failed to create Gist on the server.' }, { status: 500 });
    }
}

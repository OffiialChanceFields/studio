
import { NextResponse } from 'next/server';
import type { Workspace } from '@/store/slices/workspaceSlice';
import type { DetailedAnalysis } from '@/lib/analyzer/types';

const GITHUB_API_URL = 'https://api.github.com';
export const GIST_FILENAME = process.env.NEXT_PUBLIC_GIST_FILE_NAME || 'GeminiVaultAgentMemory.json';

// StorableWorkspace to not include harEntries, which can be very large.
interface StorableWorkspace {
    name: string;
    analysis: DetailedAnalysis | null;
}

async function createGistOnServer(workspace: StorableWorkspace): Promise<string> {
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

        // Create a storable version of the workspace, without the harEntries
        const storableWorkspace: StorableWorkspace = {
            name: workspace.name,
            analysis: workspace.analysis,
        };

        const gistId = await createGistOnServer(storableWorkspace);
        return NextResponse.json({ gistId });
    } catch (error: any) {
        console.error("Error creating Gist:", error);
        return NextResponse.json({ error: error.message || 'Failed to create Gist on the server.' }, { status: 500 });
    }
}

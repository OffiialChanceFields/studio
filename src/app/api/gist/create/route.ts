import { NextResponse } from 'next/server';
import type { Workspace } from '@/store/slices/workspaceSlice';
import { createGist } from '@/lib/github/gist';

export async function POST(request: Request) {
    try {
        const workspace = await request.json() as Workspace;
        if (!workspace || !workspace.name || !workspace.harEntries) {
            return NextResponse.json({ error: 'Invalid workspace data provided.' }, { status: 400 });
        }

        const gistId = await createGist(workspace);
        return NextResponse.json({ gistId });
    } catch (error: any) {
        console.error("Error creating Gist:", error);
        return NextResponse.json({ error: error.message || 'Failed to create Gist on the server.' }, { status: 500 });
    }
}

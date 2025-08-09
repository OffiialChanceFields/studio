/**
 * @fileoverview Service for interacting with GitHub Gists.
 * @module @/services/gistService
 */

import type { Workspace } from '@/store/slices/workspaceSlice';

const GITHUB_API_URL = 'https://api.github.com';
export const GIST_FILENAME = process.env.NEXT_PUBLIC_GIST_FILE_NAME || 'GeminiVaultAgentMemory.json';

// This function runs on the client-side, so we can't access process.env directly for the token.
// The token will be retrieved from an API route to keep it secure.

async function getGitHubToken(): Promise<string> {
    const res = await fetch('/api/github-token');
    if (!res.ok) {
        throw new Error('Failed to retrieve GitHub token.');
    }
    const { token } = await res.json();
    return token;
}

/**
 * Creates a new secret Gist to store the workspace data.
 * @param workspace - The workspace data to store.
 * @returns The ID of the created Gist.
 */
export async function createGist(workspace: Workspace): Promise<string> {
    const token = await getGitHubToken();
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
        throw new Error(`Failed to create Gist: ${errorData.message}`);
    }

    const gistData = await response.json();
    return gistData.id;
}

/**
 * Retrieves the workspace data from a Gist.
 * @param gistId - The ID of the Gist to retrieve.
 * @returns The workspace data.
 */
export async function getGist(gistId: string): Promise<Workspace> {
    const token = await getGitHubToken();
    
    const response = await fetch(`${GITHUB_API_URL}/gists/${gistId}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to retrieve Gist: ${errorData.message}`);
    }

    const gistData = await response.json();
    const file = gistData.files[GIST_FILENAME];

    if (!file) {
        throw new Error(`Gist does not contain the expected file: ${GIST_FILENAME}`);
    }

    try {
        const workspace: Workspace = JSON.parse(file.content);
        return workspace;
    } catch (e) {
        throw new Error('Failed to parse workspace data from Gist.');
    }
}


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
    if (!token) {
        throw new Error('GitHub token is not available. Please configure it in the settings.');
    }
    return token;
}


/**
 * Retrieves the workspace data from a Gist.
 * @param gistId - The ID of the Gist to retrieve.
 * @returns The workspace data.
 */
export async function getGist(gistId: string): Promise<Workspace> {
    const token = await getGitHubToken();
    
    const response = await fetch(`${GITHUB_API_URL}/gists/${gistId}`, {
        method: 'GET', // Explicitly setting method for clarity
        headers: {
            // The token is now the real token, not the placeholder
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

    let content: string;
    if (file.truncated) {
        const res = await fetch(file.raw_url);
        if (!res.ok) {
            throw new Error(`Failed to retrieve truncated content from ${file.raw_url}`);
        }
        content = await res.text();
    } else {
        content = file.content;
    }

    try {
        const workspace: Workspace = JSON.parse(content);
        return workspace;
    } catch (e) {
        throw new Error('Failed to parse workspace data from Gist.');
    }
}

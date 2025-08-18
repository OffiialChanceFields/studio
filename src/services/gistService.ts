
/**
 * @fileoverview Service for interacting with GitHub Gists.
 * @module @/services/gistService
 */

import type { Workspace } from '@/store/slices/workspaceSlice';

const GITHUB_API_URL = 'https://api.github.com';
export const GIST_FILENAME = process.env.NEXT_PUBLIC_GIST_FILE_NAME || 'GeminiVaultAgentMemory.json';


/**
 * Creates a Gist by calling the server-side API route.
 * @param workspace - The workspace data to store in the Gist.
 * @returns The ID of the created Gist.
 */
export async function createGistViaApi(workspace: Workspace): Promise<string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('github_token') : null;

    if (!token) {
        throw new Error("GitHub token is not available. Please configure it in the settings.");
    }
    
  const response = await fetch('/api/gist/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${token}`, // Pass token to the server
    },
    body: JSON.stringify(workspace),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create Gist via API.');
  }

  const { gistId } = await response.json();
  return gistId;
}


async function getGitHubTokenFromServer(): Promise<string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('github_token') : null;

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
    const token = await getGitHubTokenFromServer();
    
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
    const file = gistData.files[process.env.NEXT_PUBLIC_GIST_FILE_NAME || 'GeminiVaultAgentMemory.json'];

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
        const partialWorkspace = JSON.parse(content) as Omit<Workspace, 'harEntries'>;
        const workspace: Workspace = {
            ...partialWorkspace,
            harEntries: [], // harEntries are not stored in the Gist to save space.
        };
        return workspace;
    } catch (e) {
        throw new Error('Failed to parse workspace data from Gist.');
    }
}

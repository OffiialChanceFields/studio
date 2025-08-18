import type { Workspace } from '@/store/slices/workspaceSlice';
import type { DetailedAnalysis } from '@/lib/analyzer/types';

const GITHUB_API_URL = 'https://api.github.com';

interface StorableWorkspace {
    name: string;
    analysis: DetailedAnalysis | null;
}

export function getGitHubToken(): string {
    const token = process.env.GIST_TOKEN;
    if (!token) {
        throw new Error('GIST_TOKEN is not configured on the server.');
    }
    return token;
}

export async function createGist(workspace: Workspace): Promise<string> {
    const token = getGitHubToken();
    const GIST_FILENAME = process.env.NEXT_PUBLIC_GIST_FILE_NAME || 'GeminiVaultAgentMemory.json';

    const storableWorkspace: StorableWorkspace = {
        name: workspace.name,
        analysis: workspace.analysis,
    };

    const content = JSON.stringify(storableWorkspace);

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


'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, Save, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const {
    token,
    setToken,
    hasToken,
    isLoading,
    handleSaveToken,
  } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-black via-yellow-900/20 to-black rounded-lg p-6 border border-yellow-400/20 shadow-lg shadow-yellow-400/10">
          <h1 className="text-3xl font-display text-yellow-400">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your application settings and configurations.</p>
        </div>

        <Card className="bg-black/50 border-yellow-400/20 shadow-lg shadow-yellow-400/10 animate-border-glow">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-yellow-400">GitHub Configuration</CardTitle>
            <CardDescription className="text-gray-400">
              Your GitHub Personal Access Token is used to save your analysis sessions as private Gists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="bg-red-900/30 border-red-500/30 text-red-300">
                <AlertTitle className="text-red-400">Security Warning</AlertTitle>
                <AlertDescription>
                Never expose this token publicly. Ensure it has the minimum required permissions (only `gist`).
                </AlertDescription>
            </Alert>

            {hasToken ? (
              <div className="flex items-center gap-2 p-4 rounded-md bg-green-900/30 border border-green-500/30">
                <CheckCircle className="text-green-400" />
                <p className="text-green-300">GitHub token is configured on the server.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="github-token" className="text-yellow-400">Personal Access Token (PAT)</Label>
                <Input
                  id="github-token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your GitHub PAT"
                  className="bg-black/60 border-yellow-400/30"
                />
              </div>
            )}
            
            {!hasToken && (
              <Button onClick={handleSaveToken} disabled={isLoading || !token} className="bg-yellow-400 text-black hover:bg-yellow-500 disabled:bg-gray-600">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Token
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

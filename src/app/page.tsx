
'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setWorkspace } from '@/store/slices/workspaceSlice';
import { setAnalysisProgress, setAnalysisState } from '@/store/slices/analysisSlice';
import { createParser } from '@/lib/parser/HarStreamingParser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2, Rocket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createGist } from '@/services/gistService';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const onProgress = useCallback((progress: number, message?: string) => {
    setProgress(progress * 100);
    if (message) {
      setProgressMessage(message);
    }
    dispatch(setAnalysisProgress({ progress: progress * 100, message: message || '' }));
  }, [dispatch]);

  const handleProcessFile = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a HAR file to process.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    dispatch(setAnalysisState(true));
    onProgress(0, 'Starting processing...');

    try {
      const fileContent = await file.text();
      onProgress(0.05, 'File read into memory.');

      const parser = createParser();
      const harEntries = await parser.parse(fileContent, onProgress);

      const workspace = {
        name: file.name,
        harEntries,
      };

      onProgress(0.95, 'Saving analysis to secure storage...');
      const gistId = await createGist(workspace);
      sessionStorage.setItem('gistId', gistId);
      
      onProgress(1, 'Analysis complete. Redirecting...');
      toast({
        title: 'Processing Complete',
        description: `${harEntries.length} entries parsed and stored.`,
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to process HAR file:', error);
      toast({
        title: 'Processing Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      dispatch(setAnalysisState(false));
      setProgress(0);
      setProgressMessage('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-headline text-yellow-400 tracking-wider">HAR2LoliCode</h1>
            <p className="text-xl text-gray-400 mt-2">
              The premier solution for converting HAR files into high-performance LoliCode scripts.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="w-full bg-black/50 border-yellow-400/20 shadow-lg shadow-yellow-400/10 animate-border-glow">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-yellow-400 flex items-center gap-2">
                        <FileUp className="w-6 h-6" />
                        Upload Your HAR File
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Select a HAR file from your device to begin the analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center w-full">
                        <label
                        htmlFor="har-file-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-yellow-400/30 bg-black/30 hover:bg-black/50 hover:border-yellow-400/50 transition-colors"
                        >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-10 h-10 mb-3 text-yellow-400/80" />
                            <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-yellow-400">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">HAR files only (max 50MB)</p>
                            {file && <p className="text-xs text-green-400 mt-2">{file.name}</p>}
                        </div>
                        <Input id="har-file-upload" type="file" className="hidden" accept=".har" onChange={handleFileChange} />
                        </label>
                    </div>

                    {isProcessing && (
                        <div className="space-y-2">
                        <Progress value={progress} className="w-full [&>div]:bg-yellow-400" />
                        <p className="text-sm text-center text-yellow-400/90 h-5">{progressMessage}</p>
                        </div>
                    )}

                    <Button
                        onClick={handleProcessFile}
                        disabled={!file || isProcessing}
                        className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 text-lg py-6"
                    >
                        {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing...
                        </>
                        ) : (
                        <>
                            <Rocket className="mr-2 h-5 w-5" />
                            Analyze & Generate
                        </>
                        )}
                    </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                 <Alert className="bg-black/50 border-yellow-400/20 animate-border-glow">
                    <Rocket className="h-4 w-4 text-yellow-400" />
                    <AlertTitle className="text-yellow-400">How it Works</AlertTitle>
                    <AlertDescription className="text-gray-400">
                        1. Upload a HAR file from your browser's network inspector. <br />
                        2. Our engine analyzes dependencies and the critical request path. <br />
                        3. Customize the script by selecting requests and adding variables. <br />
                        4. Generate and download your optimized LoliCode script.
                    </AlertDescription>
                </Alert>
                <Card className="bg-black/50 border-yellow-400/20 animate-border-glow">
                    <CardHeader>
                         <CardTitle className="text-xl text-yellow-500">Why HAR2LoliCode?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-400 space-y-2">
                        <p>✓ Automated dependency detection saves hours of manual work.</p>
                        <p>✓ Generates optimized, human-readable LoliCode.</p>
                        <p>✓ Interactive UI to visualize and customize your script.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}

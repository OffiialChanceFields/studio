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
import { FileUp, Loader2 } from 'lucide-react';

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
      const parser = createParser();
      const harEntries = await parser.parse(fileContent, onProgress);

      dispatch(
        setWorkspace({
          name: file.name,
          harEntries,
        })
      );
      
      onProgress(1, 'Analysis complete. Redirecting...');
      toast({
        title: 'Processing Complete',
        description: `${harEntries.length} entries parsed successfully.`,
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-black to-gold-primary/10" style={{background: '#1A1A1A'}}>
      <div className="z-10 w-full max-w-2xl items-center justify-between text-sm lg:flex flex-col">
        <Card className="w-full bg-black/30 border-gold-primary/20 shadow-lg shadow-gold-primary/10">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-gold-primary text-center tracking-wider">HAR2LoliCode</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Convert HTTP Archive (HAR) files into executable LoliCode scripts for OpenBullet 2.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center w-full">
                <label
                  htmlFor="har-file-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-gold-primary/30 bg-black/20 hover:bg-black/40 hover:border-gold-primary/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-10 h-10 mb-3 text-gold-primary/70" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold text-gold-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">HAR files only (max 50MB)</p>
                    {file && <p className="text-xs text-green-400 mt-2">{file.name}</p>}
                  </div>
                  <Input id="har-file-upload" type="file" className="hidden" accept=".har" onChange={handleFileChange} />
                </label>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full [&>div]:bg-gold-primary" />
                  <p className="text-sm text-center text-gold-primary/80">{progressMessage}</p>
                </div>
              )}

              <Button
                onClick={handleProcessFile}
                disabled={!file || isProcessing}
                className="w-full bg-gold-primary text-black font-bold hover:bg-gold-secondary disabled:bg-gray-600 disabled:text-gray-400"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Analyze HAR File'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

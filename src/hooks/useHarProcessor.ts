'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setAnalysisProgress, setAnalysisState } from '@/store/slices/analysisSlice';
import { createParser } from '@/lib/parser/HarStreamingParser';
import { useToast } from '@/hooks/use-toast';
import { createGist } from '@/services/gistService';

export function useHarProcessor() {
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

      const parser = createParser({ includeResponseBodies: false });
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

  return {
    file,
    isProcessing,
    progress,
    progressMessage,
    handleFileChange,
    handleProcessFile,
  };
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setAnalysisProgress, setAnalysisState, setHarEntries } from '@/store/slices/analysisSlice';
import { ParserFactory, Parser } from '@/lib/parser/ParserFactory';
import { useToast } from '@/hooks/use-toast';
import type { Workspace } from '@/store/slices/workspaceSlice';
import type { SemanticHarEntry } from '@/lib/parser/types';
import { createGistViaApi } from '@/services/gistService';
import pako from 'pako';

export function useHarProcessor() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const onProgress = useCallback((progress: number, message?: string) => {
    setProgress(progress);
    if (message) {
      setProgressMessage(message);
    }
    dispatch(setAnalysisProgress({ progress: progress, message: message || '' }));
  }, [dispatch]);

  const handleProcessFile = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to process.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    dispatch(setAnalysisState(true));
    onProgress(0, 'Initializing parser...');

    try {
      const parser: Parser = ParserFactory.createParser(file);
      const harEntries: SemanticHarEntry[] = [];

      for await (const result of parser.parseWithProgress(file)) {
        switch (result.type) {
          case 'progress':
            const msg = `Parsing... ${result.entriesParsed || 0} entries found.`;
            onProgress(result.percent || 0, msg);
            break;
          case 'entry':
            if (result.data) {
              harEntries.push(result.data);
              dispatch(setHarEntries(harEntries)); // Update Redux store with new entries
            }
            break;
          case 'done':
            onProgress(95, `Parsing complete. Found ${result.entriesParsed} entries. Saving session...`);
            break;
          case 'error':
            throw new Error(result.message || 'An unknown parsing error occurred.');
        }
      }
      
      const workspace: Workspace = {
        name: file.name,
        harEntries,
        analysis: null,
      };

      // Create a storable version of the workspace, without the harEntries
      const storableWorkspace: Omit<Workspace, 'harEntries'> = {
        name: workspace.name,
        analysis: workspace.analysis,
      };

      const gistId = await createGistViaApi(storableWorkspace);
      sessionStorage.setItem('gistId', gistId);

      // Compress and store harEntries in sessionStorage
      try {
        const compressedHarEntries = pako.deflate(JSON.stringify(harEntries), { to: 'string' });
        sessionStorage.setItem(`harEntries_${gistId}`, compressedHarEntries);
      } catch (e) {
        console.error('Failed to save HAR entries to session storage:', e);
        toast({
          title: 'Error Saving Session',
          description: 'Could not save HAR entries to session storage. The session will not be restorable on page refresh.',
          variant: 'destructive',
        });
      }

      onProgress(100, 'Analysis complete. Redirecting...');
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

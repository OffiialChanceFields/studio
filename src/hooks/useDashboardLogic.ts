
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setWorkspace, clearWorkspace, setAnalysis } from '@/store/slices/workspaceSlice';
import { applyFilters } from '@/lib/filter/harFilter';
import { buildDependencyMatrix } from '@/lib/analyzer/DependencyMatrixBuilder';
import { generateLoliCode, LoliCodeConfig } from '@/lib/generator/LoliCodeGenerator';
import type { SemanticHarEntry } from '@/lib/parser/types';
import { useRouter, usePathname } from 'next/navigation';
import { getGist } from '@/services/gistService';
import { useToast } from '@/hooks/use-toast';
import { openDetailModal } from '@/store/slices/uiSlice';
import { setSelectedIndices } from '@/store/slices/generatorSlice';
import pako from 'pako';
import type { Workspace } from '@/store/slices/workspaceSlice';

export function useDashboardLogic() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { currentWorkspace } = useAppSelector(state => state.workspace);
  const filterState = useAppSelector(state => state.filter);
  const generatorState = useAppSelector(state => state.generator);

  const [isLoading, setIsLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [activeTab, setActiveTab] = useState<'requests' | 'dependencies' | 'generator' | 'ai'>(() => {
    if (pathname.includes('/generator')) return 'generator';
    return 'requests';
  });
  
  useEffect(() => {
    const loadWorkspace = async () => {
      const gistId = sessionStorage.getItem('gistId');
      if (!gistId) {
        toast({ title: "No analysis session found", description: "Please upload a HAR file first.", variant: "destructive" });
        router.push('/');
        return;
      }

      if (currentWorkspace?.name === gistId) {
          setIsLoading(false);
          return;
      }

      try {
        setIsLoading(true);
        if (currentWorkspace) {
          dispatch(clearWorkspace());
        }

        // Try to load harEntries from sessionStorage first
        const compressedHarEntries = sessionStorage.getItem(`harEntries_${gistId}`);
        if (compressedHarEntries) {
          try {
            const decompressed = pako.inflate(compressedHarEntries as any, { to: 'string' });
            const harEntries = JSON.parse(decompressed);
            const workspaceData = await getGist(gistId); // still get metadata from gist
            const fullWorkspace: Workspace = { ...workspaceData, harEntries, name: gistId };
            dispatch(setWorkspace(fullWorkspace));
          } catch (e) {
            console.error('Failed to load or parse HAR entries from session storage:', e);
            toast({ title: "Failed to load session data", description: "Could not load data from the browser session. Please try uploading the file again.", variant: "destructive" });
            router.push('/');
            return;
          }
        } else {
          // Fallback to old behavior if session data is not found
          const workspaceData = await getGist(gistId);
          dispatch(setWorkspace({...workspaceData, name: gistId}));
        }

      } catch (error: any) {
        console.error("Failed to load workspace from Gist:", error);
        toast({ title: "Failed to load session", description: error.message || 'An unknown error occurred during session loading.', variant: "destructive" });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const harEntries = useMemo(() => currentWorkspace?.harEntries || [], [currentWorkspace]);

  const filteredEntries = useMemo(() => {
    if (harEntries.length === 0) return [];
    return applyFilters(harEntries, filterState);
  }, [harEntries, filterState]);

  const analysis = useMemo(() => {
    if (filteredEntries.length === 0 || isLoading) return null;
    if (currentWorkspace?.analysis) return currentWorkspace.analysis;
    try {
      return buildDependencyMatrix(filteredEntries);
    } catch (e) {
      console.error("Failed to build dependency matrix", e);
      toast({ title: "Analysis Failed", description: "Could not build the dependency matrix.", variant: "destructive" });
      return null;
    }
  }, [filteredEntries, isLoading, toast, currentWorkspace?.analysis]);

  useEffect(() => {
    if (analysis && !currentWorkspace?.analysis) {
      dispatch(setAnalysis(analysis));
    }
  }, [analysis, dispatch, currentWorkspace?.analysis]);

  const statistics = useMemo(() => {
    if (filteredEntries.length === 0) {
      return { totalRequests: 0, uniqueDomains: 0, totalDataTransferred: 0, averageResponseTime: 0, successRate: 0 };
    }
    const domains = new Set(filteredEntries.map(e => { try { return new URL(e.request.url).hostname; } catch { return 'invalid'; } }));
    const totalData = filteredEntries.reduce((sum, e) => sum + (e.response.body?.size || 0) + (e.request.body?.size || 0), 0);
    const avgTime = filteredEntries.reduce((sum, e) => sum + e.duration, 0) / filteredEntries.length;
    const successCount = filteredEntries.filter(e => e.response.status >= 200 && e.response.status < 400).length;
    return {
      totalRequests: filteredEntries.length,
      uniqueDomains: domains.size,
      totalDataTransferred: totalData,
      averageResponseTime: avgTime,
      successRate: (successCount / filteredEntries.length) * 100
    };
  }, [filteredEntries]);

  const handleOpenDetailModal = useCallback((entry: SemanticHarEntry) => {
    const originalIndex = harEntries.findIndex(e => e.entryId === entry.entryId);
    dispatch(openDetailModal(originalIndex));
  }, [dispatch, harEntries]);

  const handleGenerateCode = useCallback(async () => {
    try {
      if (!analysis) throw new Error('No analysis available');
      if (generatorState.selectedIndices.length === 0) {
        toast({ title: "No Requests Selected", description: "Please select requests to include in the script.", variant: "destructive" });
        return;
      }
      const code = await generateLoliCode(generatorState, filteredEntries, analysis);
      setGeneratedCode(code);
      router.push('/dashboard/generator');
      toast({ title: "LoliCode Generated", description: `Successfully generated script with ${generatorState.selectedIndices.length} requests.` });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    }
  }, [filteredEntries, analysis, toast, router, generatorState]);

  const handleCopyCode = useCallback(() => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({ title: "Copied to Clipboard", description: "LoliCode script has been copied." });
    }
  }, [generatedCode, toast]);

  const handleSelectAiRequests = useCallback((suggestedIds: string[]) => {
    const selectedIndices = suggestedIds.map(id => filteredEntries.findIndex(e => e.entryId === id)).filter(index => index !== -1);

    if (selectedIndices.length === 0) {
      toast({ title: "No Suggested Requests Found", description: "Could not find any of the AI suggested requests in the current filtered list.", variant: "destructive" });
      return;
    }

    dispatch(setSelectedIndices(selectedIndices));
    router.push('/dashboard/generator');
    toast({ title: "AI Requests Selected", description: `Selected ${selectedIndices.length} requests. Ready to generate.` });

  }, [filteredEntries, dispatch, router, toast]);

  return {
    isLoading,
    currentWorkspace,
    harEntries,
    filteredEntries,
    analysis,
    statistics,
    activeTab,
    setActiveTab,
    generatedCode,
    handleOpenDetailModal,
    handleGenerateCode,
    handleCopyCode,
    handleSelectAiRequests,
  };
}

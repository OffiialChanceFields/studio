
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentPage } from '@/store/slices/analysisSlice';
import { setWorkspace, clearWorkspace, setAnalysis } from '@/store/slices/workspaceSlice';
import { applyFilters } from '@/lib/filter/harFilter';
import { buildDependencyMatrix } from '@/lib/analyzer/DependencyMatrixBuilder';
import { generateLoliCode, LoliCodeConfig } from '@/lib/generator/LoliCodeGenerator';
import type { SemanticHarEntry } from '@/lib/parser/types';
import { useRouter } from 'next/navigation';
import { getGist } from '@/services/gistService';
import { useToast } from '@/hooks/use-toast';
import { openDetailModal } from '@/store/slices/uiSlice';

export function useDashboardLogic() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { currentWorkspace } = useAppSelector(state => state.workspace);
  const filterState = useAppSelector(state => state.filter);
  const { currentPage, requestsPerPage } = useAppSelector(state => state.analysis);

  const [isLoading, setIsLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'dependencies' | 'generator' | 'ai'>('requests');

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
        const workspaceData = await getGist(gistId);
        dispatch(setWorkspace({...workspaceData, name: gistId}));
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

  const harEntries = currentWorkspace?.harEntries || [];

  const filteredEntries = useMemo(() => {
    if (harEntries.length === 0) return [];
    return applyFilters(harEntries, filterState);
  }, [harEntries, filterState]);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return filteredEntries.slice(startIndex, endIndex);
  }, [filteredEntries, currentPage, requestsPerPage]);

  const analysis = useMemo(() => {
    if (filteredEntries.length === 0 || isLoading) return null;
    try {
      if (currentWorkspace?.analysis) return currentWorkspace.analysis;
      const result = buildDependencyMatrix(filteredEntries);
      dispatch(setAnalysis(result));
      return result;
    } catch (e) {
      console.error("Failed to build dependency matrix", e);
      toast({ title: "Analysis Failed", description: "Could not build the dependency matrix.", variant: "destructive" });
      return null;
    }
  }, [filteredEntries, isLoading, toast, dispatch, currentWorkspace?.analysis]);

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

  const handleOpenDetailModal = useCallback((entry: SemanticHarEntry, index: number) => {
    const originalIndex = harEntries.findIndex(e => e.entryId === entry.entryId);
    dispatch(openDetailModal(originalIndex));
  }, [dispatch, harEntries]);

  const handleGenerateCode = useCallback((config: LoliCodeConfig) => {
    try {
      if (!analysis) throw new Error('No analysis available');
      const code = generateLoliCode(config, filteredEntries, analysis);
      setGeneratedCode(code);
      setActiveTab('generator');
      toast({ title: "LoliCode Generated", description: `Successfully generated script with ${config.selectedIndices.length} requests.` });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    }
  }, [filteredEntries, analysis, toast]);

  const handleCopyCode = useCallback(() => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({ title: "Copied to Clipboard", description: "LoliCode script has been copied." });
    }
  }, [generatedCode, toast]);

  useEffect(() => {
    if (generatedCode) setActiveTab('generator');
  }, [generatedCode]);

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setCurrentPage(newPage));
  }, [dispatch]);

  return {
    isLoading,
    currentWorkspace,
    harEntries,
    filteredEntries,
    paginatedEntries,
    analysis,
    statistics,
    activeTab,
    setActiveTab,
    generatedCode,
    handleOpenDetailModal,
    handleGenerateCode,
    handleCopyCode,
    currentPage,
    requestsPerPage,
    handlePageChange,
  };
}

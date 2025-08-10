
/**
 * @fileoverview Main dashboard page with integrated HAR analysis
 * @module @/app/dashboard
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setWorkspace, clearWorkspace } from '@/store/slices/workspaceSlice';
import { applyFilters } from '@/lib/filter/harFilter';
import { buildDependencyMatrix } from '@/lib/analyzer/DependencyMatrixBuilder';
import { generateLoliCode, LoliCodeConfig } from '@/lib/generator/LoliCodeGenerator';
import type { SemanticHarEntry } from '@/lib/parser/types';
import { useRouter } from 'next/navigation';
import { getGist } from '@/services/gistService';

// Components
import { FilterManager } from '@/components/filter/FilterManager';
import { RequestDataTable } from '@/components/analysis/RequestDataTable';
import { RequestDetailModal } from '@/components/analysis/RequestDetailModal';
import { TokenDetectionPanel } from '@/components/analysis/TokenDetectionPanel';
import { LoliCodeCustomizer } from '@/components/generator/LoliCodeCustomizer';
import { LoliCodePreview } from '@/components/generator/LoliCodePreview';
import { DependencyGraph } from '@/components/analysis/DependencyGraph';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { openDetailModal } from '@/store/slices/uiSlice';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { currentWorkspace } = useAppSelector(state => state.workspace);
  const filterState = useAppSelector(state => state.filter);
  
  const [isLoading, setIsLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'requests' | 'dependencies' | 'generator'>('requests');
  
  useEffect(() => {
    const loadWorkspace = async () => {
      const gistId = sessionStorage.getItem('gistId');
      if (!gistId) {
        toast({ title: "No analysis session found", description: "Please upload a HAR file first.", variant: "destructive" });
        router.push('/');
        return;
      }

      try {
        setIsLoading(true);
        // Clear previous workspace before loading a new one
        if (currentWorkspace) {
            dispatch(clearWorkspace());
        }
        const workspaceData = await getGist(gistId);
        dispatch(setWorkspace(workspaceData));
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
  
  const dependencyMatrix = useMemo(() => {
    if (filteredEntries.length === 0 || isLoading) return null;
    try {
      return buildDependencyMatrix(filteredEntries);
    } catch(e) {
      console.error("Failed to build dependency matrix", e);
      toast({ title: "Analysis Failed", description: "Could not build the dependency matrix.", variant: "destructive" });
      return null;
    }
  }, [filteredEntries, isLoading, toast]);
  
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
      if (!dependencyMatrix) throw new Error('No dependency matrix available');
      const code = generateLoliCode(config, filteredEntries, dependencyMatrix);
      setGeneratedCode(code);
      setActiveTab('generator');
      toast({ title: "LoliCode Generated", description: `Successfully generated script with ${config.selectedIndices.length} requests.` });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    }
  }, [filteredEntries, dependencyMatrix, toast]);
  
  const handleCopyCode = useCallback(() => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({ title: "Copied to Clipboard", description: "LoliCode script has been copied." });
    }
  }, [generatedCode, toast]);
  
  useEffect(() => {
    if (generatedCode) setActiveTab('generator');
  }, [generatedCode]);

  if (isLoading || !currentWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-96 col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="bg-gradient-to-r from-black via-yellow-900/20 to-black rounded-lg p-6 border border-yellow-400/20 shadow-lg shadow-yellow-400/10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display text-yellow-400 flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                HAR Analysis Dashboard
              </h1>
              <p className="text-gray-400 mt-2">{currentWorkspace?.name || 'No workspace loaded'}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center p-4 bg-black/30 rounded-lg border border-yellow-400/10"><div className="text-2xl font-bold text-yellow-400">{statistics.totalRequests}</div><div className="text-xs text-gray-400">Requests</div></div>
              <div className="text-center p-4 bg-black/30 rounded-lg border border-yellow-400/10"><div className="text-2xl font-bold text-yellow-400">{statistics.uniqueDomains}</div><div className="text-xs text-gray-400">Domains</div></div>
              <div className="text-center p-4 bg-black/30 rounded-lg border border-yellow-400/10"><div className="text-2xl font-bold text-yellow-400">{(statistics.totalDataTransferred / 1024).toFixed(1)}KB</div><div className="text-xs text-gray-400">Data</div></div>
              <div className="text-center p-4 bg-black/30 rounded-lg border border-yellow-400/10"><div className="text-2xl font-bold text-yellow-400">{statistics.averageResponseTime.toFixed(0)}ms</div><div className="text-xs text-gray-400">Avg Time</div></div>
              <div className="text-center p-4 bg-black/30 rounded-lg border border-yellow-400/10"><div className="text-2xl font-bold text-yellow-400">{statistics.successRate.toFixed(0)}%</div><div className="text-xs text-gray-400">Success</div></div>
            </div>
          </div>
        </div>
        
        <div className="border border-yellow-400/20 rounded-lg p-4 bg-gradient-to-br from-black to-yellow-900/10">
          <FilterManager totalEntries={harEntries.length} filteredCount={filteredEntries.length} />
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="bg-black border border-yellow-400/20"><TabsTrigger value="requests" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">Requests ({filteredEntries.length})</TabsTrigger><TabsTrigger value="dependencies" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black" disabled={!dependencyMatrix}>Dependencies</TabsTrigger><TabsTrigger value="generator" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black" disabled={filteredEntries.length === 0}>Generator</TabsTrigger></TabsList>
          
          <TabsContent value="requests" className="mt-4 space-y-6"><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><RequestDataTable entries={filteredEntries} onEntryClick={handleOpenDetailModal} dependencyMatrix={dependencyMatrix} /></div><div className="space-y-6"><TokenDetectionPanel entries={filteredEntries} /></div></div></TabsContent>
          <TabsContent value="dependencies" className="mt-4">{dependencyMatrix && <DependencyGraph entries={filteredEntries} matrix={dependencyMatrix} onNodeClick={(index) => handleOpenDetailModal(filteredEntries[index], index)} />}</TabsContent>
          <TabsContent value="generator" className="mt-4 space-y-6"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><LoliCodeCustomizer entries={filteredEntries} dependencyMatrix={dependencyMatrix!} onGenerate={handleGenerateCode} /><LoliCodePreview code={generatedCode} onCopy={handleCopyCode} onDownload={() => { const blob = new Blob([generatedCode], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'script.loli'; a.click(); URL.revokeObjectURL(url); }} /></div></TabsContent>
        </Tabs>
        
        <RequestDetailModal />
      </div>
    </div>
  );
}

    
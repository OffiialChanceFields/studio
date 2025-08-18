
'use client';

import React, { useState } from 'react';
import { useDashboardLogic } from '@/hooks/useDashboardLogic';
import { useRequestTable } from '@/hooks/useRequestTable';
import { summarizeHarInsights } from '@/ai/flows/summarize-har-insights';

// Components
import { FilterManager } from '@/components/filter/FilterManager';
import { RequestDataTable } from '@/components/analysis/RequestDataTable';
import { RequestDetailModal } from '@/components/analysis/RequestDetailModal';
import { TokenDetectionPanel } from '@/components/analysis/TokenDetectionPanel';
import { DependencyGraph } from '@/components/analysis/DependencyGraph';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const {
    isLoading,
    currentWorkspace,
    harEntries,
    filteredEntries,
    analysis,
    statistics,
    activeTab,
    setActiveTab,
    handleOpenDetailModal,
    handleSelectAiRequests,
  } = useDashboardLogic();

  const {
    currentPage,
    requestsPerPage,
    totalPages,
    paginatedEntries,
    handlePageChange,
  } = useRequestTable(filteredEntries);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSuggestedRequests, setAiSuggestedRequests] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAiAnalysis = async () => {
    if (!currentWorkspace) return;
    if (filteredEntries.length === 0) {
      toast({
        title: 'No Data to Analyze',
        description: 'Apply filters that result in at least one request to use AI Insights.',
        variant: 'destructive',
      });
      return;
    }

    setIsAiLoading(true);
    setAiSummary('');
    try {
      const harData = JSON.stringify({ log: { entries: filteredEntries.map(e => ({...e, entryId: e.entryId})) } });
      const result = await summarizeHarInsights({ harData });
      setAiSummary(result.summary);
      setAiSuggestedRequests(result.suggestedRequestIds || []);
      toast({ title: 'AI Analysis Complete', description: 'Insights have been generated.' });
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not generate insights for the provided data.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };


  if (isLoading || !currentWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-display text-yellow-400 animate-pulse">Analyzing Your Data...</h2>
          <p className="text-gray-400 mt-2">Loading workspace and building request dependency graph.</p>
        </div>
        <div className="w-full max-w-4xl mt-8 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-96 col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
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
          <TabsList className="bg-black border border-yellow-400/20">
            <TabsTrigger value="requests" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">Requests ({filteredEntries.length})</TabsTrigger>
            <TabsTrigger value="dependencies" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black" disabled={!analysis}>Dependencies</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4 space-y-6"><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><RequestDataTable entries={paginatedEntries} onEntryClick={handleOpenDetailModal} analysis={analysis} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} aiSuggestedRequests={aiSuggestedRequests} /></div><div className="space-y-6"><TokenDetectionPanel /></div></div></TabsContent>
          <TabsContent value="dependencies" className="mt-4">{analysis && <DependencyGraph entries={filteredEntries} matrix={analysis} onNodeClick={(index) => handleOpenDetailModal(filteredEntries[index])} />}</TabsContent>
          <TabsContent value="ai" className="mt-4">
            <Card className="bg-black/30 border-yellow-400/20 animate-border-glow">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex justify-between items-center">
                  <span>AI-Powered Insights</span>
                  <div className="flex gap-2">
                    {aiSuggestedRequests.length > 0 && (
                      <Button onClick={() => handleSelectAiRequests(aiSuggestedRequests)} className="bg-green-500 text-black hover:bg-green-600">
                        Select Suggested for LoliCode
                      </Button>
                    )}
                    <Button onClick={handleAiAnalysis} disabled={isAiLoading} className="bg-yellow-400 text-black hover:bg-yellow-500">
                      {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                      {isAiLoading ? 'Analyzing...' : 'Generate Insights'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[500px] overflow-auto p-4 text-white rounded-md bg-black/40">
                {isAiLoading && (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 text-yellow-400 animate-spin" />
                  </div>
                )}
                {aiSummary ? (
                  <pre className="text-sm whitespace-pre-wrap font-mono">{aiSummary}</pre>
                ) : (
                  !isAiLoading && <p className="text-center text-gray-400">Click &quot;Generate Insights&quot; to analyze the filtered requests.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <RequestDetailModal />
      </div>
    </div>
  );
}

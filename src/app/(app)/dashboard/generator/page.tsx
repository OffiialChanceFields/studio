'use client';

import React from 'react';
import { useDashboardLogic } from '@/hooks/useDashboardLogic';

// Components
import { LoliCodeCustomizer } from '@/components/generator/LoliCodeCustomizer';
import { LoliCodePreview } from '@/components/generator/LoliCodePreview';
import { Skeleton } from '@/components/ui/skeleton';

export default function GeneratorPage() {
  const {
    isLoading,
    currentWorkspace,
    harEntries,
    analysis,
    generatedCode,
    handleGenerateCode,
    handleCopyCode,
  } = useDashboardLogic();

  if (isLoading || !currentWorkspace || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-display text-yellow-400 animate-pulse">Loading Generator...</h2>
          <p className="text-gray-400 mt-2">Preparing the code generation environment.</p>
        </div>
        <div className="w-full max-w-4xl mt-8 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-code.lol';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="bg-gradient-to-r from-black via-yellow-900/20 to-black rounded-lg p-6 border border-yellow-400/20 shadow-lg shadow-yellow-400/10">
          <h1 className="text-3xl font-display text-yellow-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            LoliCode Generator
          </h1>
          <p className="text-gray-400 mt-2">
            Select requests from your HAR file to generate a LoliCode script for automated testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoliCodeCustomizer
            entries={harEntries}
            dependencyMatrix={analysis}
            onGenerate={handleGenerateCode}
          />
          <LoliCodePreview
            code={generatedCode}
            onCopy={handleCopyCode}
            onDownload={handleDownloadCode}
          />
        </div>
      </div>
    </div>
  );
}

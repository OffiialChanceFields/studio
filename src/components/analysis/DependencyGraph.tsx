
'use client';

import React from 'react';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DetailedAnalysis } from '@/lib/analyzer/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DependencyGraphProps {
  entries: SemanticHarEntry[];
  matrix: DetailedAnalysis;
  onNodeClick: (index: number) => void;
}

export function DependencyGraph({ entries, matrix, onNodeClick }: DependencyGraphProps) {
  // A real implementation would use a library like vis.js, d3, or react-flow.
  // This is a simplified representation.
  return (
    <Card className="bg-black/30 border-yellow-400/20 animate-border-glow">
      <CardHeader>
        <CardTitle className="text-yellow-400">Dependency Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-auto p-4 text-white rounded-md bg-black/40">
          <p className="text-center text-gray-400 mb-4">(This is a simplified view of the dependency graph)</p>
          <div className="space-y-2 font-mono text-sm">
            {matrix.topologicalOrder.map((entryIndex) => {
              const entry = entries[entryIndex];
              const dependencies = matrix.adjacencyMatrix[entryIndex]
                .map((val, i) => (val === 1 ? i : -1))
                .filter(i => i !== -1);
              return (
                <div key={entry.entryId} className="p-2 rounded bg-black/60 hover:bg-yellow-400/10 cursor-pointer border border-yellow-400/20" onClick={() => onNodeClick(entryIndex)}>
                  <p className="text-yellow-500">
                    <span className="font-bold">[{entryIndex}]</span> {entry.request.method} {new URL(entry.request.url).pathname}
                  </p>
                  {dependencies.length > 0 && (
                     <p className="text-xs text-gray-400 pl-4">
                       Depends on: [{dependencies.join(', ')}]
                     </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

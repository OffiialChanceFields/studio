'use client';

import React from 'react';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DependencyMatrix } from '@/lib/analyzer/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DependencyGraphProps {
  entries: SemanticHarEntry[];
  matrix: DependencyMatrix;
  onNodeClick: (index: number) => void;
}

export function DependencyGraph({ entries, matrix, onNodeClick }: DependencyGraphProps) {
  // A real implementation would use a library like vis.js, d3, or react-flow.
  // This is a simplified representation.
  return (
    <Card className="bg-black/20 border-gold-primary/30">
      <CardHeader>
        <CardTitle className="text-gold-primary">Dependency Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-auto p-4 text-white rounded-md bg-black/30">
          <p className="text-center text-gray-400 mb-4">(This is a simplified view of the dependency graph)</p>
          <div className="space-y-2 font-mono text-sm">
            {matrix.topologicalOrder.map((entryIndex) => {
              const entry = entries[entryIndex];
              const dependencies = matrix.adjacencyMatrix[entryIndex]
                .map((val, i) => (val === 1 ? i : -1))
                .filter(i => i !== -1);
              return (
                <div key={entry.entryId} className="p-2 rounded bg-black/50 hover:bg-gold-primary/10 cursor-pointer" onClick={() => onNodeClick(entryIndex)}>
                  <p className="text-gold-secondary">
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

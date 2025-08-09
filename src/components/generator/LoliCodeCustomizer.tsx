'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DependencyMatrix } from '@/lib/analyzer/types';
import type { LoliCodeConfig } from '@/lib/generator/LoliCodeGenerator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface LoliCodeCustomizerProps {
  entries: SemanticHarEntry[];
  dependencyMatrix: DependencyMatrix;
  onGenerate: (config: LoliCodeConfig) => void;
}

export function LoliCodeCustomizer({ entries, dependencyMatrix, onGenerate }: LoliCodeCustomizerProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(() => dependencyMatrix.criticalPath);

  const handleToggleIndex = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  
  const handleSelectAll = () => {
    setSelectedIndices(entries.map((_, i) => i));
  }

  const handleSelectNone = () => {
    setSelectedIndices([]);
  }

  const handleSelectCriticalPath = () => {
    setSelectedIndices(dependencyMatrix.criticalPath);
  }

  const generate = () => {
    const config: LoliCodeConfig = {
      selectedIndices,
      settings: {
        useProxy: true,
        followRedirects: false,
        timeout: 15000,
      }
    };
    onGenerate(config);
  };

  return (
    <Card className="bg-black/30 border-yellow-400/20">
      <CardHeader>
        <CardTitle className="text-yellow-400">LoliCode Customizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-bold text-yellow-500 mb-2">Select Requests</h4>
          <div className="flex gap-2 mb-2">
            <Button size="sm" onClick={handleSelectAll}>All</Button>
            <Button size="sm" onClick={handleSelectNone}>None</Button>
            <Button size="sm" onClick={handleSelectCriticalPath}>Critical Path</Button>
          </div>
          <ScrollArea className="h-64 border border-yellow-400/20 rounded-md p-2 bg-black/40">
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div key={entry.entryId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`req-${index}`}
                    checked={selectedIndices.includes(index)}
                    onCheckedChange={() => handleToggleIndex(index)}
                  />
                  <Label htmlFor={`req-${index}`} className="text-sm font-normal text-gray-300 truncate cursor-pointer">
                    [{index}] {entry.request.method} {new URL(entry.request.url).pathname}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <Button onClick={generate} className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-500">
          Generate LoliCode
        </Button>
      </CardContent>
    </Card>
  );
}

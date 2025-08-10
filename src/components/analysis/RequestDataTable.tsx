'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DependencyMatrix } from '@/lib/analyzer/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequestDataTableProps {
  entries: SemanticHarEntry[];
  onEntryClick: (entry: SemanticHarEntry, index: number) => void;
  dependencyMatrix: DependencyMatrix | null;
}

const ROW_HEIGHT = 41; // Estimated height of a single row in pixels
const OVERSCAN_COUNT = 5; // Number of rows to render above and below the visible area

export function RequestDataTable({ entries, onEntryClick, dependencyMatrix }: RequestDataTableProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600); // Default height

  useEffect(() => {
    if (scrollContainerRef.current) {
      setContainerHeight(scrollContainerRef.current.clientHeight);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const getStatusColor = (status: number) => {
    if (status >= 500) return 'bg-red-500';
    if (status >= 400) return 'bg-yellow-500';
    if (status >= 300) return 'bg-blue-500';
    if (status >= 200) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const totalHeight = entries.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_COUNT);
  const endIndex = Math.min(entries.length - 1, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN_COUNT);

  const visibleEntries = entries.slice(startIndex, endIndex + 1);

  return (
    <ScrollArea
      className="h-[600px] rounded-lg border border-yellow-400/20 bg-black/30 p-1"
      onScroll={handleScroll}
      ref={scrollContainerRef}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <Table style={{ position: 'absolute', top: startIndex * ROW_HEIGHT, width: '100%' }}>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-yellow-400/30">
              <TableHead className="w-[80px]">Method</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[100px]">Duration</TableHead>
              <TableHead className="w-[100px]">Depth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEntries.map((entry) => {
              // Find the original index to pass to onEntryClick and to get dependency depth
              const originalIndex = entries.findIndex(e => e.entryId === entry.entryId);
              return (
                <TableRow
                  key={entry.entryId}
                  onClick={() => onEntryClick(entry, originalIndex)}
                  className="cursor-pointer hover:bg-yellow-400/10 border-b-yellow-400/20"
                  style={{ height: ROW_HEIGHT }}
                >
                  <TableCell><Badge variant="outline" className="border-yellow-400/60 text-yellow-400">{entry.request.method}</Badge></TableCell>
                  <TableCell><Badge className={getStatusColor(entry.response.status)}>{entry.response.status}</Badge></TableCell>
                  <TableCell className="truncate max-w-xs">{new URL(entry.request.url).pathname}</TableCell>
                  <TableCell>{entry.duration.toFixed(0)}ms</TableCell>
                  <TableCell>{dependencyMatrix?.depths[originalIndex] ?? '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}

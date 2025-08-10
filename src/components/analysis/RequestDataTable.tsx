'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DetailedAnalysis } from '@/lib/analyzer/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequestDataTableProps {
  entries: SemanticHarEntry[];
  onEntryClick: (entry: SemanticHarEntry, index: number) => void;
  analysis: DetailedAnalysis | null;
}

const ROW_HEIGHT = 41; // Estimated height of a single row in pixels
const OVERSCAN_COUNT = 5; // Number of rows to render above and below the visible area

export function RequestDataTable({ entries, onEntryClick, analysis }: RequestDataTableProps) {
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

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (entries[i]) {
        items.push({ entry: entries[i], originalIndex: i });
      }
    }
    return items;
  }, [entries, startIndex, endIndex]);

  return (
    <div className="rounded-lg border border-yellow-400/20 bg-black/30 p-1">
      {entries.length > 50 && (
        <div className="text-right text-sm text-gray-400 px-4 pt-2">
          Displaying {startIndex + 1} - {Math.min(endIndex + 1, entries.length)} of {entries.length} requests
        </div>
      )}
      <ScrollArea
        className="h-[600px]"
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
                <TableHead className="w-[100px]">Score</TableHead>
                <TableHead className="w-[100px]">Tokens</TableHead>
                <TableHead className="w-[100px]">Duration</TableHead>
                <TableHead className="w-[100px]">Depth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map(({ entry, originalIndex }) => {
                const requestAnalysis = analysis?.requestAnalysis[originalIndex];
                const isCritical = requestAnalysis?.isCritical ?? false;
                const isRedundant = requestAnalysis?.isRedundant ?? false;
                const score = requestAnalysis?.score ?? 0;
                const tokens = requestAnalysis?.tokens ?? [];

                return (
                  <TableRow
                    key={entry.entryId}
                    onClick={() => onEntryClick(entry, originalIndex)}
                    className={`cursor-pointer hover:bg-yellow-400/10 border-b-yellow-400/20 ${
                      isCritical ? 'bg-yellow-900/30' : ''
                    } ${isRedundant ? 'opacity-50' : ''}`}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <TableCell><Badge variant="outline" className="border-yellow-400/60 text-yellow-400">{entry.request.method}</Badge></TableCell>
                    <TableCell><Badge className={getStatusColor(entry.response.status)}>{entry.response.status}</Badge></TableCell>
                    <TableCell className="truncate max-w-xs">{new URL(entry.request.url).pathname}</TableCell>
                    <TableCell>{(score * 100).toFixed(0)}%</TableCell>
                    <TableCell>{tokens.map(t => t.type).join(', ')}</TableCell>
                    <TableCell>{entry.duration.toFixed(0)}ms</TableCell>
                    <TableCell>{analysis?.depths[originalIndex] ?? '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}

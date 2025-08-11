
'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DetailedAnalysis } from '@/lib/analyzer/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequestDataTableProps {
  entries: SemanticHarEntry[];
  onEntryClick: (entry: SemanticHarEntry) => void;
  analysis: DetailedAnalysis | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RequestDataTable({
  entries,
  onEntryClick,
  analysis,
  currentPage,
  totalPages,
  onPageChange,
}: RequestDataTableProps) {
  const { currentWorkspace } = useAppSelector(state => state.workspace);

  const getStatusColor = (status: number) => {
    if (status >= 500) return 'bg-red-500';
    if (status >= 400) return 'bg-yellow-500';
    if (status >= 300) return 'bg-blue-500';
    if (status >= 200) return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <div className="rounded-lg border border-yellow-400/20 bg-black/30 p-1">
      <ScrollArea className="h-[600px]">
        <Table>
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
            {entries.map((entry) => {
              const originalIndex = analysis?.requestAnalysis && currentWorkspace ? 
                currentWorkspace.harEntries.findIndex(e => e.entryId === entry.entryId) : -1;
              const requestAnalysis = originalIndex !== -1 && analysis ? analysis.requestAnalysis[originalIndex] : undefined;

              const isCritical = requestAnalysis?.isCritical ?? false;
              const isRedundant = requestAnalysis?.isRedundant ?? false;
              const score = requestAnalysis?.score ?? 0;
              const tokens = requestAnalysis?.tokens ?? [];

              return (
                <TableRow
                  key={entry.entryId}
                  onClick={() => onEntryClick(entry)}
                  className={`cursor-pointer hover:bg-yellow-400/10 border-b-yellow-400/20 ${
                    isCritical ? 'bg-yellow-900/30' : ''
                  } ${isRedundant ? 'opacity-50' : ''}`}
                >
                  <TableCell><Badge variant="outline" className="border-yellow-400/60 text-yellow-400">{entry.request.method}</Badge></TableCell>
                  <TableCell><Badge className={getStatusColor(entry.response.status)}>{entry.response.status}</Badge></TableCell>
                  <TableCell className="truncate max-w-xs">{new URL(entry.request.url).pathname}</TableCell>
                  <TableCell>{(score * 100).toFixed(0)}%</TableCell>
                  <TableCell>{tokens.map(t => t.type).join(', ')}</TableCell>
                  <TableCell>{entry.duration.toFixed(0)}ms</TableCell>
                  <TableCell>{originalIndex !== -1 && analysis ? (analysis.depths[originalIndex] ?? '-') : '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-gray-400">
          Showing page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

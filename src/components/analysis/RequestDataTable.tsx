'use client';

import React from 'react';
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

export function RequestDataTable({ entries, onEntryClick, dependencyMatrix }: RequestDataTableProps) {
  const getStatusColor = (status: number) => {
    if (status >= 500) return 'bg-red-500';
    if (status >= 400) return 'bg-yellow-500';
    if (status >= 300) return 'bg-blue-500';
    if (status >= 200) return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <ScrollArea className="h-[600px] rounded-lg border border-yellow-400/40 bg-black/30 p-1">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-yellow-400/40">
            <TableHead className="w-[80px]">Method</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="w-[100px]">Duration</TableHead>
            <TableHead className="w-[100px]">Depth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow
              key={entry.entryId}
              onClick={() => onEntryClick(entry, index)}
              className="cursor-pointer hover:bg-yellow-400/10 border-b-yellow-400/20"
            >
              <TableCell><Badge variant="outline" className="border-yellow-400/60 text-yellow-400">{entry.request.method}</Badge></TableCell>
              <TableCell><Badge className={getStatusColor(entry.response.status)}>{entry.response.status}</Badge></TableCell>
              <TableCell className="truncate max-w-xs">{new URL(entry.request.url).pathname}</TableCell>
              <TableCell>{entry.duration.toFixed(0)}ms</TableCell>
              <TableCell>{dependencyMatrix?.depths[index] ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeDetailModal } from '@/store/slices/uiSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

function KeyValueTable({ data }: { data: Record<string, string> }) {
  return (
    <div className="text-xs font-mono">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex border-b border-yellow-400/20 py-1">
          <div className="w-1/3 text-yellow-400/90 truncate">{key}</div>
          <div className="w-2/3 text-gray-300 break-all">{value}</div>
        </div>
      ))}
    </div>
  );
}

export function RequestDetailModal() {
  const dispatch = useAppAppDispatch();
  const { isDetailModalOpen, selectedEntryIndex } = useAppSelector(state => state.ui);
  const { currentWorkspace } = useAppSelector(state => state.workspace);
  const entry = currentWorkspace && selectedEntryIndex !== null ? currentWorkspace.harEntries[selectedEntryIndex] : null;
  const analysis = currentWorkspace?.analysis;
  const requestAnalysis = analysis?.requestAnalysis[selectedEntryIndex!];

  if (!entry) return null;

  return (
    <Dialog open={isDetailModalOpen} onOpenChange={(isOpen) => !isOpen && dispatch(closeDetailModal())}>
      <DialogContent className="max-w-4xl h-[80vh] bg-black border-yellow-400/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 truncate">{entry.request.method} {entry.request.url}</DialogTitle>
          <DialogDescription>
            Status: {entry.response.status} | Duration: {entry.duration.toFixed(2)}ms | Size: {(entry.response.body?.size ?? 0) / 1024} KB
          </DialogDescription>
        </DialogHeader>
        <div className="h-[calc(80vh-100px)]">
          <Tabs defaultValue="request" className="h-full flex flex-col">
            <TabsList className="bg-black/60 border border-yellow-400/20">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="tokens" disabled={!requestAnalysis || requestAnalysis.tokens.length === 0}>Tokens</TabsTrigger>
              <TabsTrigger value="dependencies" disabled={!analysis}>Dependencies</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-grow mt-2">
              <TabsContent value="request">
                <h4 className="font-bold text-yellow-400 mb-2">Headers</h4>
                <KeyValueTable data={entry.request.headers} />
                {entry.request.cookies && Object.keys(entry.request.cookies).length > 0 && <>
                  <h4 className="font-bold text-yellow-400 mt-4 mb-2">Cookies</h4>
                  <KeyValueTable data={entry.request.cookies} />
                </>}
                {entry.request.body && <>
                  <h4 className="font-bold text-yellow-400 mt-4 mb-2">Body</h4>
                  <pre className="text-xs bg-black/60 p-2 rounded-md whitespace-pre-wrap break-all">{entry.request.body.data}</pre>
                </>}
              </TabsContent>
              <TabsContent value="response">
                <h4 className="font-bold text-yellow-400 mb-2">Headers</h4>
                <KeyValueTable data={entry.response.headers} />
                {entry.response.cookies && Object.keys(entry.response.cookies).length > 0 && <>
                  <h4 className="font-bold text-yellow-400 mt-4 mb-2">Cookies</h4>
                  <KeyValueTable data={entry.response.cookies} />
                </>}
                {entry.response.body && <>
                  <h4 className="font-bold text-yellow-400 mt-4 mb-2">Body</h4>
                  <pre className="text-xs bg-black/60 p-2 rounded-md whitespace-pre-wrap break-all">{entry.response.body.data}</pre>
                </>}
              </TabsContent>
              <TabsContent value="tokens">
                {requestAnalysis?.tokens.map((token, i) => (
                  <div key={i} className="mb-2">
                    <h4 className="font-bold text-yellow-500">{token.type}</h4>
                    <p className="text-xs text-gray-400">Value: {token.value}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="dependencies">
                <h4 className="font-bold text-yellow-400 mb-2">Prerequisites</h4>
                <ul>
                  {analysis?.adjacencyMatrix[selectedEntryIndex!]?.map((dep, i) =>
                    dep === 1 ? <li key={i}>Entry {i}</li> : null
                  )}
                </ul>
                <h4 className="font-bold text-yellow-400 mt-4 mb-2">Dependents</h4>
                <ul>
                  {analysis?.adjacencyMatrix.map((row, i) =>
                    row[selectedEntryIndex!] === 1 ? <li key={i}>Entry {i}</li> : null
                  )}
                </ul>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

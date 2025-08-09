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
        <div key={key} className="flex border-b border-gold-primary/10 py-1">
          <div className="w-1/3 text-gold-primary/80 truncate">{key}</div>
          <div className="w-2/3 text-gray-300 break-all">{value}</div>
        </div>
      ))}
    </div>
  );
}

export function RequestDetailModal() {
  const dispatch = useAppDispatch();
  const { isDetailModalOpen, selectedEntryIndex } = useAppSelector(state => state.ui);
  const { currentWorkspace } = useAppSelector(state => state.workspace);
  const entry = currentWorkspace && selectedEntryIndex !== null ? currentWorkspace.harEntries[selectedEntryIndex] : null;

  if (!entry) return null;

  return (
    <Dialog open={isDetailModalOpen} onOpenChange={(isOpen) => !isOpen && dispatch(closeDetailModal())}>
      <DialogContent className="max-w-4xl h-[80vh] bg-black border-gold-primary/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-primary truncate">{entry.request.method} {entry.request.url}</DialogTitle>
          <DialogDescription>
            Status: {entry.response.status} | Duration: {entry.duration.toFixed(2)}ms | Size: {(entry.response.body?.size ?? 0) / 1024} KB
          </DialogDescription>
        </DialogHeader>
        <div className="h-[calc(80vh-100px)]">
          <Tabs defaultValue="request" className="h-full flex flex-col">
            <TabsList className="bg-black/50 border border-gold-primary/20">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-grow mt-2">
              <TabsContent value="request">
                <h4 className="font-bold text-gold-primary mb-2">Headers</h4>
                <KeyValueTable data={entry.request.headers} />
                {entry.request.cookies && Object.keys(entry.request.cookies).length > 0 && <>
                  <h4 className="font-bold text-gold-primary mt-4 mb-2">Cookies</h4>
                  <KeyValueTable data={entry.request.cookies} />
                </>}
                {entry.request.body && <>
                  <h4 className="font-bold text-gold-primary mt-4 mb-2">Body</h4>
                  <pre className="text-xs bg-black/50 p-2 rounded-md whitespace-pre-wrap break-all">{entry.request.body.data}</pre>
                </>}
              </TabsContent>
              <TabsContent value="response">
                <h4 className="font-bold text-gold-primary mb-2">Headers</h4>
                <KeyValueTable data={entry.response.headers} />
                {entry.response.cookies && Object.keys(entry.response.cookies).length > 0 && <>
                  <h4 className="font-bold text-gold-primary mt-4 mb-2">Cookies</h4>
                  <KeyValueTable data={entry.response.cookies} />
                </>}
                {entry.response.body && <>
                  <h4 className="font-bold text-gold-primary mt-4 mb-2">Body</h4>
                  <pre className="text-xs bg-black/50 p-2 rounded-md whitespace-pre-wrap break-all">{entry.response.body.data}</pre>
                </>}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

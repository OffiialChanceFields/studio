'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function TokenDetectionPanel() {
  const { analysis } = useAppSelector(state => state.workspace.currentWorkspace || {});
  const [isMasked, setIsMasked] = useState(true);

  const detectedTokens = analysis?.detectedTokens || [];

  return (
    <Card className="bg-black/30 border-yellow-400/20 animate-border-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-yellow-400">Detected Tokens</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setIsMasked(!isMasked)}>
          {isMasked ? 'Show' : 'Hide'}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {detectedTokens.length > 0 ? (
            <div className="space-y-4">
              {detectedTokens.map((token, i) => (
                <div key={i}>
                  <h4 className="font-bold text-yellow-500 mb-1">{token.type}</h4>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="font-mono text-xs truncate bg-gray-700 text-gray-300">
                      {isMasked ? '********' : token.value}
                    </Badge>
                    <div className="text-xs text-gray-400">
                      Source: Entry {token.sourceEntry} ({token.sourceLocation})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tokens detected.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

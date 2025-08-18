'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { TokenInfo } from '@/lib/analyzer/types';
import { addVariableExtraction } from '@/store/slices/generatorSlice';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper to escape regex special characters
const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export function TokenDetectionPanel() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const currentWorkspace = useAppSelector(state => state.workspace.currentWorkspace);
  const analysis = currentWorkspace?.analysis;
  const [isMasked, setIsMasked] = useState(true);

  const detectedTokens = analysis?.detectedTokens || [];

  const handleAddVariable = (token: TokenInfo) => {
    const variableName = `${token.type}_${token.sourceEntry}`;
    dispatch(addVariableExtraction({
      entryIndex: token.sourceEntry,
      extraction: {
        variableName,
        type: 'regex',
        pattern: escapeRegex(token.value),
        isGlobal: true,
      }
    }));
    toast({
      title: "Variable Extraction Added",
      description: `Rule created for ${variableName} from Entry ${token.sourceEntry}.`
    });
  };

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
              {detectedTokens.map((token: TokenInfo, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
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
                  <Button variant="ghost" size="sm" onClick={() => handleAddVariable(token)}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
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

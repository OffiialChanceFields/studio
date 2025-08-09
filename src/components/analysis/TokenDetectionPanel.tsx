'use client';

import React, { useMemo } from 'react';
import type { SemanticHarEntry } from '@/lib/parser/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TokenDetectionPanelProps {
  entries: SemanticHarEntry[];
}

const tokenPatterns: Record<string, RegExp> = {
  JWT: /([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g,
  CSRF: /csrf[_-]?token["'=\s:]+([a-zA-Z0-9_-]{16,})/g,
  SessionID: /session[_-]?id["'=\s:]+([a-zA-Z0-9_-]{16,})/g,
  APIKey: /api[_-]?key["'=\s:]+([a-zA-Z0-9_-]{16,})/g,
};

export function TokenDetectionPanel({ entries }: TokenDetectionPanelProps) {
  const detectedTokens = useMemo(() => {
    const tokens = new Map<string, Set<string>>();
    
    entries.forEach(entry => {
      const textToSearch = JSON.stringify(entry.request.headers) +
                           (entry.request.body?.data || '') +
                           JSON.stringify(entry.response.headers) +
                           (entry.response.body?.data || '');

      for (const [type, pattern] of Object.entries(tokenPatterns)) {
        const matches = textToSearch.matchAll(pattern);
        for (const match of matches) {
          if (!tokens.has(type)) {
            tokens.set(type, new Set());
          }
          tokens.get(type)!.add(match[1]);
        }
      }
    });

    return tokens;
  }, [entries]);

  return (
    <Card className="bg-black/20 border-gold-primary/30">
      <CardHeader>
        <CardTitle className="text-gold-primary">Detected Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {Array.from(detectedTokens.entries()).length > 0 ? (
            <div className="space-y-4">
              {Array.from(detectedTokens.entries()).map(([type, values]) => (
                <div key={type}>
                  <h4 className="font-bold text-gold-secondary mb-1">{type}</h4>
                  <div className="flex flex-col gap-1">
                    {Array.from(values).map((value, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-xs truncate bg-gray-700 text-gray-300">
                        {value}
                      </Badge>
                    ))}
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

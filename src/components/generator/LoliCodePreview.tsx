'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download } from 'lucide-react';

interface LoliCodePreviewProps {
  code: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function LoliCodePreview({ code, onCopy, onDownload }: LoliCodePreviewProps) {
  return (
    <Card className="bg-black/30 border-yellow-400/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-yellow-400">LoliCode Preview</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopy} disabled={!code}>
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload} disabled={!code}>
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 bg-black/60 rounded-md p-2 border border-yellow-400/20">
          <pre className="text-xs text-white font-mono whitespace-pre-wrap">
            {code || '// Generate code to see preview...'}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

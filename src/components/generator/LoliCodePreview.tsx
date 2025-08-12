'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download } from 'lucide-react';

interface LoliCodePreviewProps {
  code: string;
  refinedCode?: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function LoliCodePreview({
  code,
  refinedCode,
  onCopy,
  onDownload,
}: LoliCodePreviewProps) {
  const showComparison = refinedCode && refinedCode !== code;

  return (
    <Card className="bg-black/30 border-yellow-400/20 animate-border-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-yellow-400">LoliCode Preview</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopy} disabled={!code}>
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload
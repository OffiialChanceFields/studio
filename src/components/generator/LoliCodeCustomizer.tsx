
'use client';

import React, { useState, useCallback } from 'react';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DetailedAnalysis } from '@/lib/analyzer/types';
import type { LoliCodeConfig, CustomHeader, CustomAssertion, VariableExtraction } from '@/lib/generator/LoliCodeGenerator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2 } from 'lucide-react';

interface LoliCodeCustomizerProps {
  entries: SemanticHarEntry[];
  dependencyMatrix: DetailedAnalysis;
  onGenerate: (config: LoliCodeConfig) => void;
}

export function LoliCodeCustomizer({ entries, dependencyMatrix, onGenerate }: LoliCodeCustomizerProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(() => dependencyMatrix?.criticalPath || []);
  const [customHeaders, setCustomHeaders] = useState<Record<number, CustomHeader[]>>({});
  const [customAssertions, setCustomAssertions] = useState<Record<number, CustomAssertion[]>>({});
  const [variableExtractions, setVariableExtractions] = useState<Record<number, VariableExtraction[]>>({});
  const [shouldRefine, setShouldRefine] = useState(false);

  const handleToggleIndex = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].sort((a,b) => a-b)
    );
  };
  
  const handleSelectAll = () => setSelectedIndices(entries.map((_, i) => i));
  const handleSelectNone = () => setSelectedIndices([]);
  const handleSelectCriticalPath = () => setSelectedIndices(dependencyMatrix?.criticalPath || []);

  const updateConfig = <T,>(setter: React.Dispatch<React.SetStateAction<Record<number, T[]>>>, index: number, itemIndex: number, newValues: Partial<T>) => {
    setter(prev => ({
      ...prev,
      [index]: prev[index].map((item, i) => i === itemIndex ? { ...item, ...newValues } : item)
    }));
  };

  const addConfigItem = <T,>(setter: React.Dispatch<React.SetStateAction<Record<number, T[]>>>, index: number, newItem: T) => {
    setter(prev => ({ ...prev, [index]: [...(prev[index] || []), newItem] }));
  };

  const removeConfigItem = <T,>(setter: React.Dispatch<React.SetStateAction<Record<number, T[]>>>, index: number, itemIndex: number) => {
    setter(prev => ({ ...prev, [index]: prev[index].filter((_, i) => i !== itemIndex) }));
  };

  const generate = () => {
    const config: LoliCodeConfig = {
      selectedIndices,
      customHeaders,
      customAssertions,
      variableExtractions,
      refine: shouldRefine,
      settings: {
        useProxy: true,
        followRedirects: false,
        timeout: 15000,
      }
    };
    onGenerate(config);
  };

  return (
    <Card className="bg-black/30 border-yellow-400/20 animate-border-glow">
      <CardHeader>
        <CardTitle className="text-yellow-400">LoliCode Customizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-bold text-yellow-500 mb-2">Select Requests</h4>
          <div className="flex gap-2 mb-2">
            <Button size="sm" onClick={handleSelectAll}>All</Button>
            <Button size="sm" onClick={handleSelectNone}>None</Button>
            <Button size="sm" onClick={handleSelectCriticalPath} disabled={!dependencyMatrix}>Critical Path</Button>
          </div>
          <ScrollArea className="h-40 border border-yellow-400/20 rounded-md p-2 bg-black/40">
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div key={entry.entryId} className="flex items-center space-x-2">
                  <Checkbox id={`req-${index}`} checked={selectedIndices.includes(index)} onCheckedChange={() => handleToggleIndex(index)} />
                  <Label htmlFor={`req-${index}`} className="text-sm font-normal text-gray-300 truncate cursor-pointer">
                    [{index}] {entry.request.method} {new URL(entry.request.url).pathname}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div>
          <h4 className="font-bold text-yellow-500 mb-2">Configure Requests</h4>
          <ScrollArea className="h-64 border border-yellow-400/20 rounded-md bg-black/40">
            <Accordion type="multiple" className="w-full">
              {selectedIndices.map((index) => {
                const entry = entries[index];
                return (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="px-4 text-yellow-400">[{index}] {entry.request.method} {new URL(entry.request.url).pathname}</AccordionTrigger>
                  <AccordionContent className="px-4 space-y-4">
                    
                    {/* HEADERS */}
                    <div>
                      <h5 className="font-semibold mb-2 flex justify-between items-center">
                        Headers
                        <Button size="sm" variant="ghost" onClick={() => addConfigItem(setCustomHeaders, index, {key: '', value: '', enabled: true})}>
                          <PlusCircle size={16} />
                        </Button>
                      </h5>
                      <div className="space-y-2">
                        {(customHeaders[index] || []).map((header, hIndex) => (
                          <div key={hIndex} className="flex gap-2 items-center">
                            <Checkbox checked={header.enabled} onCheckedChange={(c) => updateConfig(setCustomHeaders, index, hIndex, { enabled: !!c })} />
                            <Input placeholder="Key" value={header.key} onChange={(e) => updateConfig(setCustomHeaders, index, hIndex, { key: e.target.value })} className="bg-black/60"/>
                            <Input placeholder="Value" value={header.value} onChange={(e) => updateConfig(setCustomHeaders, index, hIndex, { value: e.target.value })} className="bg-black/60"/>
                            <Button size="icon" variant="ghost" onClick={() => removeConfigItem(setCustomHeaders, index, hIndex)}><Trash2 size={16} /></Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ASSERTIONS */}
                    <div>
                      <h5 className="font-semibold mb-2 flex justify-between items-center">
                        Assertions (Keychecks)
                        <Button size="sm" variant="ghost" onClick={() => addConfigItem(setCustomAssertions, index, {type: 'status', value: '200', action: 'success'})}>
                          <PlusCircle size={16} />
                        </Button>
                      </h5>
                       <div className="space-y-2">
                        {(customAssertions[index] || []).map((assertion, aIndex) => (
                          <div key={aIndex} className="flex gap-2 items-center">
                            <Select value={assertion.type} onValueChange={(v) => updateConfig(setCustomAssertions, index, aIndex, { type: v as any })}>
                              <SelectTrigger className="w-[120px] bg-black/60"><SelectValue/></SelectTrigger>
                              <SelectContent><SelectItem value="status">Status</SelectItem><SelectItem value="contains">Contains</SelectItem><SelectItem value="regex">Regex</SelectItem></SelectContent>
                            </Select>
                            <Input placeholder="Value" value={assertion.value} onChange={(e) => updateConfig(setCustomAssertions, index, aIndex, { value: e.target.value })} className="bg-black/60"/>
                            <Button size="icon" variant="ghost" onClick={() => removeConfigItem(setCustomAssertions, index, aIndex)}><Trash2 size={16} /></Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* EXTRACTIONS */}
                    <div>
                      <h5 className="font-semibold mb-2 flex justify-between items-center">
                        Variable Extractions (Parse)
                        <Button size="sm" variant="ghost" onClick={() => addConfigItem(setVariableExtractions, index, {type: 'regex', pattern: '', variableName: '', isGlobal: false})}>
                          <PlusCircle size={16} />
                        </Button>
                      </h5>
                      <div className="space-y-2">
                        {(variableExtractions[index] || []).map((extraction, eIndex) => (
                           <div key={eIndex} className="flex gap-2 items-center">
                             <Select value={extraction.type} onValueChange={(v) => updateConfig(setVariableExtractions, index, eIndex, { type: v as any })}>
                               <SelectTrigger className="w-[100px] bg-black/60"><SelectValue/></SelectTrigger>
                               <SelectContent><SelectItem value="regex">Regex</SelectItem><SelectItem value="json">JSON</SelectItem><SelectItem value="css">CSS</SelectItem></SelectContent>
                             </Select>
                             <Input placeholder="Pattern/Selector" value={extraction.pattern} onChange={(e) => updateConfig(setVariableExtractions, index, eIndex, { pattern: e.target.value })} className="bg-black/60"/>
                             <Input placeholder="Var Name" value={extraction.variableName} onChange={(e) => updateConfig(setVariableExtractions, index, eIndex, { variableName: e.target.value })} className="w-[120px] bg-black/60"/>
                             <Button size="icon" variant="ghost" onClick={() => removeConfigItem(setVariableExtractions, index, eIndex)}><Trash2 size={16} /></Button>
                           </div>
                         ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )})}
            </Accordion>
          </ScrollArea>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="refine-checkbox" checked={shouldRefine} onCheckedChange={(checked) => setShouldRefine(!!checked)} />
          <Label htmlFor="refine-checkbox" className="font-medium text-yellow-400">
            Refine with AI ✨
          </Label>
        </div>
        <Button onClick={generate} className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-500">
          Generate LoliCode
        </Button>
      </CardContent>
    </Card>
  );
}

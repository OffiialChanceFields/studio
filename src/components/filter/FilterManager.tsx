'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addRule, updateRule, removeRule, setLogic, toggleRule, SemanticFilterRule, FilterTarget, FilterOperator } from '@/lib/filter/filterSlice';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface FilterManagerProps {
  totalEntries: number;
  filteredCount: number;
}

const filterTargets: FilterTarget[] = ['url-hostname', 'url-path', 'request-method', 'response-status', 'content-type'];
const filterOperators: FilterOperator[] = ['contains', 'not-contains', 'equals', 'not-equals', 'starts-with', 'ends-with', 'regex'];

export function FilterManager({ totalEntries, filteredCount }: FilterManagerProps) {
  const dispatch = useAppDispatch();
  const { rules, logic } = useAppSelector((state) => state.filter);

  const handleAddRule = () => {
    dispatch(addRule({ target: 'url-hostname', operator: 'contains', value: '' }));
  };

  const handleUpdateRule = (id: string, updates: Partial<SemanticFilterRule>) => {
    dispatch(updateRule({ id, updates }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-yellow-400">Filters</h3>
        <div className="flex items-center gap-4">
          <Select value={logic} onValueChange={(value: 'AND' | 'OR') => dispatch(setLogic(value))}>
            <SelectTrigger className="w-[100px] bg-black/60 border-yellow-400/30 text-white">
              <SelectValue placeholder="Logic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddRule} size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-2 p-2 rounded-md bg-black/30 border border-yellow-400/20">
            <Switch
              checked={rule.enabled}
              onCheckedChange={() => dispatch(toggleRule(rule.id))}
            />
            <Select value={rule.target} onValueChange={(v) => handleUpdateRule(rule.id, { target: v as FilterTarget })}>
              <SelectTrigger className="w-[180px] bg-black/60 border-yellow-400/30"><SelectValue /></SelectTrigger>
              <SelectContent>{filterTargets.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={rule.operator} onValueChange={(v) => handleUpdateRule(rule.id, { operator: v as FilterOperator })}>
              <SelectTrigger className="w-[150px] bg-black/60 border-yellow-400/30"><SelectValue /></SelectTrigger>
              <SelectContent>{filterOperators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Input
              value={rule.value}
              onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
              className="flex-grow bg-black/60 border-yellow-400/30"
            />
            <div className="flex items-center space-x-2">
              <Switch id={`case-${rule.id}`} checked={rule.caseSensitive} onCheckedChange={(c) => handleUpdateRule(rule.id, {caseSensitive: c})} />
              <Label htmlFor={`case-${rule.id}`} className="text-xs">Aa</Label>
            </div>
            <Button variant="ghost" size="icon" onClick={() => dispatch(removeRule(rule.id))} className="text-red-500 hover:bg-red-500/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

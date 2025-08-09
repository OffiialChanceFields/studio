/**
 * @fileoverview HAR entry filtering engine
 * @module @/lib/filter
 */

import type { SemanticHarEntry } from '@/lib/parser/types';
import type { FilterState, SemanticFilterRule, FilterTarget } from './filterSlice';
import { StringOperators } from './operators/StringOperators';
import { NumericOperators } from './operators/NumericOperators';
import { RegexOperators } from './operators/RegexOperators';

/**
 * Apply filter rules to HAR entries
 * @param entries - Array of HAR entries to filter
 * @param filterState - Current filter configuration
 * @returns Filtered array of HAR entries
 */
export function applyFilters(
  entries: SemanticHarEntry[],
  filterState: FilterState
): SemanticHarEntry[] {
  // If filters are disabled or no rules, return all entries
  if (!filterState.isActive || filterState.rules.length === 0) {
    return entries;
  }

  // Get only enabled rules
  const activeRules = filterState.rules.filter(rule => rule.enabled);
  if (activeRules.length === 0) {
    return entries;
  }

  // Apply filters based on logic
  return entries.filter(entry => {
    const results = activeRules.map(rule => evaluateRule(entry, rule));
    
    if (filterState.logic === 'AND') {
      return results.every(r => r === true);
    } else {
      return results.some(r => r === true);
    }
  });
}

/**
 * Evaluate a single filter rule against an entry
 */
function evaluateRule(
  entry: SemanticHarEntry,
  rule: SemanticFilterRule
): boolean {
  const value = extractValue(entry, rule.target);
  
  if (value === null || value === undefined) {
    return false;
  }

  // Apply operator based on type
  switch (rule.operator) {
    // String operations
    case 'contains':
      return StringOperators.contains(String(value), rule.value, rule.caseSensitive);
    case 'not-contains':
      return !StringOperators.contains(String(value), rule.value, rule.caseSensitive);
    case 'equals':
      return StringOperators.equals(String(value), rule.value, rule.caseSensitive);
    case 'not-equals':
      return !StringOperators.equals(String(value), rule.value, rule.caseSensitive);
    case 'starts-with':
      return StringOperators.startsWith(String(value), rule.value, rule.caseSensitive);
    case 'ends-with':
      return StringOperators.endsWith(String(value), rule.value, rule.caseSensitive);
    
    // Regex operations
    case 'regex':
      return RegexOperators.matches(String(value), rule.value);
    
    // Numeric operations
    case 'greater-than':
      return NumericOperators.greaterThan(Number(value), Number(rule.value));
    case 'less-than':
      return NumericOperators.lessThan(Number(value), Number(rule.value));
    case 'in-range': {
      const [min, max] = rule.value.split('-').map(Number);
      return NumericOperators.inRange(Number(value), min, max);
    }
    
    default:
      return false;
  }
}

/**
 * Extract value from entry based on target
 */
function extractValue(
  entry: SemanticHarEntry,
  target: FilterTarget
): string | number | null {
  try {
    switch (target) {
      case 'url-hostname':
        return new URL(entry.request.url).hostname;
      
      case 'url-path':
        return new URL(entry.request.url).pathname;
      
      case 'url-query':
        return new URL(entry.request.url).search;
      
      case 'request-method':
        return entry.request.method;
      
      case 'request-header':
        return JSON.stringify(entry.request.headers);
      
      case 'response-status':
        return entry.response.status;
      
      case 'response-header':
        return JSON.stringify(entry.response.headers);
      
      case 'content-type':
        return entry.response.headers['content-type'] || '';
      
      case 'token-payload':
        // Check both request and response for tokens
        const requestBody = entry.request.body?.data || '';
        const responseBody = entry.response.body?.data || '';
        return requestBody + responseBody;
      
      case 'cookie-name':
        return Object.keys({
          ...entry.request.cookies,
          ...entry.response.cookies
        }).join(',');
      
      case 'cookie-value':
        return Object.values({
          ...entry.request.cookies,
          ...entry.response.cookies
        }).join(',');
      
      default:
        return null;
    }
  } catch(e) {
    return null;
  }
}

/**
 * Get matching entry indices for highlighting
 */
export function getMatchingIndices(
  entries: SemanticHarEntry[],
  filterState: FilterState
): number[] {
  const filtered = applyFilters(entries, filterState);
  return entries
    .map((entry, index) => filtered.includes(entry) ? index : -1)
    .filter(index => index !== -1);
}

/**
 * Export filter configuration to JSON
 */
export function exportFilterConfig(filterState: FilterState): string {
  return JSON.stringify({
    rules: filterState.rules,
    logic: filterState.logic
  }, null, 2);
}

/**
 * Import filter configuration from JSON
 */
export function importFilterConfig(json: string): Omit<FilterState, 'isActive'> {
  try {
    const config = JSON.parse(json);
    return {
      rules: config.rules || [],
      logic: config.logic || 'AND',
    };
  } catch (error: any) {
    throw new Error(`Invalid filter configuration: ${error.message}`);
  }
}

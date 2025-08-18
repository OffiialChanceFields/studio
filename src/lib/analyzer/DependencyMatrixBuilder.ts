
/**
 * @fileoverview Request dependency analysis and matrix building
 * @module @/lib/analyzer
 */

import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DetailedAnalysis, RequestAnalysis, TokenInfo } from './types';
import { TokenAnalyzer } from './TokenAnalyzer';

/**
 * Build dependency matrix from HAR entries
 * Analyzes token flow, cookie dependencies, and redirect chains
 */
export class DependencyMatrixBuilder {
  
  /**
   * Build complete dependency matrix
   * @param entries - Chronologically ordered HAR entries
   * @returns Dependency matrix with relationships
   */
  public build(entries: SemanticHarEntry[]): DetailedAnalysis {
    const emptyAnalysis: DetailedAnalysis = {
      adjacencyMatrix: [],
      criticalPath: [],
      redundantIndices: [],
      depths: [],
      topologicalOrder: [],
      requestAnalysis: [],
      detectedTokens: [],
    };

    if (!entries || entries.length === 0) {
      return emptyAnalysis;
    }

    const n = entries.length;
    const adjacencyMatrix = this.initializeMatrix(n);
    
    // Use the new TokenAnalyzer
    const tokenAnalyzer = new TokenAnalyzer();
    const detectedTokens = tokenAnalyzer.analyze(entries);
    this.addTokenDependenciesToMatrix(entries, detectedTokens, adjacencyMatrix);

    try {
      this.analyzeCookieDependencies(entries, adjacencyMatrix);
      this.analyzeRedirectChains(entries, adjacencyMatrix);
      this.analyzeReferrerDependencies(entries, adjacencyMatrix);
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
    }

    const depths = this.calculateDepths(adjacencyMatrix);
    const topologicalOrder = this.topologicalSort(adjacencyMatrix);
    const criticalPath = this.findCriticalPath(adjacencyMatrix, depths);
    const redundantIndices = this.findRedundantRequests(
      entries,
      adjacencyMatrix,
      criticalPath
    );

    const requestAnalysis = this.calculateRequestAnalysis(
      entries,
      criticalPath,
      redundantIndices,
      detectedTokens
    );

    return {
      adjacencyMatrix,
      criticalPath,
      redundantIndices,
      depths,
      topologicalOrder,
      requestAnalysis,
      detectedTokens,
    };
  }
  
  /**
   * Initialize NxN zero matrix
   */
  private initializeMatrix(n: number): number[][] {
    return Array(n).fill(null).map(() => Array(n).fill(0));
  }
  
  /**
   * Analyze cookie-based dependencies
   * Request depends on response that sets required cookie
   */
  private analyzeCookieDependencies(
    entries: SemanticHarEntry[],
    matrix: number[][]
  ): void {
    for (let i = 0; i < entries.length; i++) {
      // Safely access cookies
      const requiredCookies = entries[i]?.request?.cookies 
        ? Object.keys(entries[i].request.cookies) 
        : [];
      
      if (requiredCookies.length === 0) continue;
      
      // Look for earlier responses that set these cookies
      for (let j = 0; j < i; j++) {
        const setCookies = entries[j]?.response?.cookies 
          ? Object.keys(entries[j].response.cookies)
          : [];
        
        const hasRequiredCookie = requiredCookies.some(cookie => 
          setCookies.includes(cookie)
        );
        
        if (hasRequiredCookie) {
          matrix[i][j] = 1; // Request i depends on response j
        }
      }
    }
  }
  
  /**
   * Updates the adjacency matrix based on discovered token dependencies.
   * A request depends on another if it uses a token defined in the other's response.
   */
  private addTokenDependenciesToMatrix(
    entries: SemanticHarEntry[],
    tokens: TokenInfo[],
    matrix: number[][]
  ): void {
    if (!tokens.length) return;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry?.request) continue;

      const requestText =
        JSON.stringify(entry.request.headers) +
        (entry.request.body?.data || '') +
        entry.request.url;

      for (const token of tokens) {
        // A request can't use a token defined after it.
        if (i <= token.sourceEntry) continue;

        // If the request text includes the token value, it's a dependency.
        if (requestText.includes(token.value)) {
          matrix[i][token.sourceEntry] = 1;
        }
      }
    }
  }
  
  /**
   * Analyze redirect chain dependencies
   */
  private analyzeRedirectChains(
    entries: SemanticHarEntry[],
    matrix: number[][]
  ): void {
    for (let i = 0; i < entries.length; i++) {
      try {
        const redirectUrl = entries[i]?.response?.redirectUrl;
      
        if (!redirectUrl) continue;
        
        // Find next request to redirect URL
        for (let j = i + 1; j < entries.length; j++) {
          if (entries[j]?.request?.url === redirectUrl) {
            matrix[j][i] = 1; // Request j depends on redirect from i
            break;
          }
        }
      } catch(e) {
        // Ignore if redirectUrl is invalid
        continue;
      }
    }
  }
  
  /**
   * Analyze referrer-based dependencies
   */
  private analyzeReferrerDependencies(
    entries: SemanticHarEntry[],
    matrix: number[][]
  ): void {
    for (let i = 0; i < entries.length; i++) {
      try {
        const headers = entries[i]?.request?.headers || {};
        const referer = headers['referer'] || headers['referrer'];
        
        if (!referer) continue;
        
        // Find earlier request to referrer URL
        for (let j = 0; j < i; j++) {
          if (entries[j]?.request?.url === referer) {
            matrix[i][j] = 1; // Request i was referred by j
          }
        }
      } catch (e) {
        // Ignore if referrer is an invalid URL
        continue;
      }
    }
  }
  
  /**
   * Calculate dependency depth for each request
   */
  private calculateDepths(matrix: number[][]): number[] {
    const n = matrix.length;
    if (n === 0) return [];
    
    const depths = Array(n).fill(0);
    const visited = Array(n).fill(false);
    
    const calculateDepth = (index: number): number => {
      if (index < 0 || index >= n) return 0;
      if (visited[index]) return depths[index];
      visited[index] = true;
      
      let maxDepth = 0;
      for (let j = 0; j < n; j++) {
        if (matrix[index][j] === 1) {
          maxDepth = Math.max(maxDepth, calculateDepth(j) + 1);
        }
      }
      
      depths[index] = maxDepth;
      return maxDepth;
    };
    
    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        calculateDepth(i);
      }
    }
    
    return depths;
  }
  
  /**
   * Perform topological sort on dependency graph
   */
  private topologicalSort(matrix: number[][]): number[] {
    const n = matrix.length;
    if (n === 0) return [];
    
    const adj = new Map<number, number[]>();
    const inDegree = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] === 1) { // j -> i
          if (!adj.has(j)) adj.set(j, []);
          adj.get(j)!.push(i);
          inDegree[i]++;
        }
      }
    }

    const queue: number[] = [];
    for (let i = 0; i < n; i++) {
      if (inDegree[i] === 0) {
        queue.push(i);
      }
    }

    const result: number[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      result.push(u);

      for (const v of adj.get(u) || []) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      }
    }

    // If cycle detected, return indices in order
    if (result.length !== n) {
      return Array.from({ length: n }, (_, i) => i);
    }
    
    return result;
  }
  
  /**
   * Find critical path through dependency graph
   */
  private findCriticalPath(
    matrix: number[][],
    depths: number[]
  ): number[] {
    const n = matrix.length;
    if (n === 0 || depths.length === 0) return [];
    
    // Find request with maximum depth (end of critical path)
    let maxDepth = -1;
    let endNode = -1;
    for (let i = 0; i < n; i++) {
      if (depths[i] > maxDepth) {
        maxDepth = depths[i];
        endNode = i;
      }
    }

    if (endNode === -1 || maxDepth === 0) {
      // No dependencies found, return first entry as critical path
      return n > 0 ? [0] : [];
    }
    
    // Trace back critical path
    const path: number[] = [endNode];
    let current = endNode;
    const visited = new Set<number>();
    
    while (depths[current] > 0 && !visited.has(current)) {
      visited.add(current);
      
      // Find dependency with maximum depth
      let nextNode = -1;
      let nextDepth = -1;
      
      for (let j = 0; j < n; j++) {
        if (matrix[current][j] === 1 && depths[j] >= nextDepth && !visited.has(j)) {
          nextDepth = depths[j];
          nextNode = j;
        }
      }
      
      if (nextNode !== -1 && depths[nextNode] < depths[current]) {
        path.unshift(nextNode);
        current = nextNode;
      } else {
        break;
      }
    }
    
    return path;
  }
  
  /**
   * Find redundant requests that can be removed
   */
  private findRedundantRequests(
    entries: SemanticHarEntry[],
    matrix: number[][],
    criticalPath: number[]
  ): number[] {
    const redundant: number[] = [];
    const n = entries.length;
    
    if (n === 0) return [];
    
    for (let i = 0; i < n; i++) {
      // Skip if in critical path
      if (criticalPath.includes(i)) continue;
      
      // Check if request has no dependents
      let hasDependents = false;
      for (let j = 0; j < n; j++) {
        if (matrix[j][i] === 1) { // i is a dependency for j
          hasDependents = true;
          break;
        }
      }
      
      if (!hasDependents) {
        // Additional checks for redundancy
        const entry = entries[i];
        
        if (!entry) continue;
        
        // Mark as redundant if:
        // 1. OPTIONS preflight requests
        // 2. Failed requests (4xx, 5xx) not in critical path  
        if (
          entry.request?.method === 'OPTIONS' ||
          (entry.response?.status && entry.response.status >= 400)
        ) {
          redundant.push(i);
        }
      }
    }
    
    return redundant;
  }
  
  /**
   * Check if request is duplicate of earlier request
   */
  private isDuplicateRequest(
    entries: SemanticHarEntry[],
    index: number
  ): boolean {
    const entry = entries[index];
    
    if (!entry?.request) return false;
    
    for (let i = 0; i < index; i++) {
      const otherEntry = entries[i];
      if (!otherEntry?.request) continue;
      
      try {
        if (
          otherEntry.request.url === entry.request.url &&
          otherEntry.request.method === entry.request.method
        ) {
          return true;
        }
      } catch (e) {
        // Skip comparison if there's an error
        continue;
      }
    }
    
    return false;
  }

  private calculateRequestAnalysis(
    entries: SemanticHarEntry[],
    criticalPath: number[],
    redundantIndices: number[],
    detectedTokens: TokenInfo[]
  ): RequestAnalysis[] {
    return entries.map((entry, i) => {
      const isCritical = criticalPath.includes(i);
      const isRedundant = redundantIndices.includes(i);
      const tokens = detectedTokens.filter(t => {
        const requestText =
          JSON.stringify(entry.request.headers) + (entry.request.body?.data || '');
        return requestText.includes(t.value);
      });

      let score = 0.5;
      if (isCritical) score += 0.3;
      if (isRedundant) score -= 0.3;
      if (tokens.length > 0) score += 0.2;
      if (entry.request.method === 'POST') score += 0.1;

      return {
        isCritical,
        isRedundant,
        score: Math.max(0, Math.min(1, score)),
        tokens,
      };
    });
  }
}

export function buildDependencyMatrix(
  entries: SemanticHarEntry[]
): DetailedAnalysis {
  const builder = new DependencyMatrixBuilder();
  return builder.build(entries);
}

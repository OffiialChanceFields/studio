/**
 * Dependency matrix with request relationships
 */
export interface DependencyMatrix {
  /** NxN matrix where [i][j]=1 means request i depends on request j */
  adjacencyMatrix: number[][];
  
  /** Indices of requests forming the critical path */
  criticalPath: number[];
  
  /** Indices of redundant requests that can be removed */
  redundantIndices: number[];
  
  /** Dependency depth for each request */
  depths: number[];
  
  /** Topologically sorted request indices */
  topologicalOrder: number[];
}

export interface TokenInfo {
  type: string;
  value: string;
  sourceEntry: number; // The index of the entry where the token was first seen
  sourceLocation: 'header' | 'body' | 'cookie';
}

export interface RequestAnalysis {
  isRedundant: boolean;
  isCritical: boolean;
  score: number; // A score from 0 to 1 indicating the importance of the request
  tokens: TokenInfo[];
}

export interface DetailedAnalysis extends DependencyMatrix {
  requestAnalysis: RequestAnalysis[];
  detectedTokens: TokenInfo[];
}
